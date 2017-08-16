package fi.thl.thldtkk.api.metadata.service.csv;

import fi.thl.thldtkk.api.metadata.domain.CodeList;
import fi.thl.thldtkk.api.metadata.domain.InstanceVariable;
import fi.thl.thldtkk.api.metadata.domain.Unit;
import fi.thl.thldtkk.api.metadata.service.CodeListService;
import fi.thl.thldtkk.api.metadata.service.Service;
import fi.thl.thldtkk.api.metadata.service.UnitService;
import fi.thl.thldtkk.api.metadata.test.a;
import org.junit.Test;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import org.junit.Before;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.when;

public class InstanceVariableCsvParserTest {
  
  private Service<UUID, CodeList> mockedCodeListService;
  private UnitService mockedUnitService;
  
  InstanceVariableCsvParser parser;
  
  @Before
  public void setUp() {
  
    this.mockedCodeListService = Mockito.mock(CodeListService.class);
    this.mockedUnitService = Mockito.mock(UnitService.class);
    
    parser = new InstanceVariableCsvParser(mockedCodeListService, mockedUnitService);
  }
  
  @Test
  public void noEncodingProvided() throws Exception {
    InputStream csv = getClass().getResourceAsStream("/csv/instance-variables-all-fields.csv");

    ParsingResult<List<ParsingResult<InstanceVariable>>> results = parser.parse(csv, null);
    assertThat(results.getMessages()).containsExactly("import.csv.error.noEncoding");

    results = parser.parse(csv, "    ");
    assertThat(results.getMessages()).containsExactly("import.csv.error.noEncoding");
  }

  @Test
  public void unsupportedEncoding() throws Exception {
    InputStream csv = getClass().getResourceAsStream("/csv/instance-variables-all-fields.csv");

    ParsingResult<List<ParsingResult<InstanceVariable>>> results = parser.parse(csv, "this is not valid encoding");

    assertThat(results.getMessages()).containsExactly("import.csv.error.unsupportedEncoding");
  }

  @Test
  public void csvWithAllFields() throws Exception {
    InputStream csv = getClass().getResourceAsStream("/csv/instance-variables-all-fields.csv");

    ParsingResult<List<ParsingResult<InstanceVariable>>> results = parser.parse(csv, "MacRoman");

    assertThat(results.getParsedObject().get()).hasSize(1);
    InstanceVariable iv = results.getParsedObject().get().iterator().next().getParsedObject().get();
    assertThat(iv.getPrefLabel().get("fi")).isEqualTo("Sukupuoli");
    assertThat(iv.getTechnicalName().orElse(null)).isEqualTo("sukup_2017");
    assertThat(iv.getDescription().get("fi")).isEqualTo("Henkilön sukupuoli, kolme vaihtoehtoa.");
    assertThat(iv.getPartOfGroup().get("fi")).isEqualTo("Taustatiedot");
    assertThat(iv.getFreeConcepts().get("fi")).isEqualTo("asia;sana;jees");
    assertThat(iv.getReferencePeriodStart().orElse(null)).isEqualTo(LocalDate.of(2017, 7, 1));
    assertThat(iv.getReferencePeriodEnd().orElse(null)).isEqualTo(LocalDate.of(2017, 7, 30));
    assertThat(iv.getValueDomainType().orElse(null)).isEqualTo("enumerated");
    assertThat(iv.getMissingValues().get("fi")).isEqualTo("Joitain arvoja saattaa puuttua.\n\nTässä kentässä on myös rivivaihtoja.");
    assertThat(iv.getDefaultMissingValue().orElse(null)).isEqualTo("-1");
    assertThat(iv.getQualityStatement().get("fi")).isEqualTo("Ei ole muita laatuun vaikuttavia tietoja.");
    assertThat(iv.getSourceDescription().get("fi")).isEqualTo("Väestörekisteri");
    assertThat(iv.getDataType().orElse(null)).isEqualTo("integer");
    assertThat(iv.getDataFormat().get("fi")).isEqualTo("(mies|nainen|muu)");
  }

  @Test
  public void csvWithPrefLabelAndDescriptionOnly() throws Exception {
    InputStream csv = getClass().getResourceAsStream("/csv/instance-variables-description-and-prefLabel-only.csv");

    ParsingResult<List<ParsingResult<InstanceVariable>>> results = parser.parse(csv, "MacRoman");

    assertThat(results.getParsedObject().get()).hasSize(1);
    InstanceVariable iv = results.getParsedObject().get().iterator().next().getParsedObject().get();
    assertThat(iv.getPrefLabel().get("fi")).isEqualTo("Nimi");
    assertThat(iv.getDescription().get("fi")).isEqualTo("Tässä on kuvausteksti.");
  }

  @Test
  public void missingPrefLabelColumn() throws Exception {
    InputStream csv = getClass().getResourceAsStream("/csv/instance-variables-no-prefLabel-column.csv");

    ParsingResult<List<ParsingResult<InstanceVariable>>> results = parser.parse(csv, "MacRoman");

    assertThat(results.getParsedObject().get()).isEmpty();
    assertThat(results.getMessages()).containsExactly("import.csv.error.missingRequiredColumn.prefLabel");
  }

  @Test
  public void missingPrefLabelOnSingleRow() throws Exception {
    InputStream csv = getClass().getResourceAsStream("/csv/instance-variables-no-prefLabel-on-single-row.csv");

    ParsingResult<List<ParsingResult<InstanceVariable>>> results = parser.parse(csv, "MacRoman");

    assertThat(results.getParsedObject().get()).hasSize(2);
    ParsingResult<InstanceVariable> firstResult = results.getParsedObject().get().iterator().next();
    assertFalse(firstResult.getParsedObject().isPresent());
    assertThat(firstResult.getMessages()).containsExactly("import.csv.error.missingRequiredValue.prefLabel");
  }

  @Test
  public void invalidReferencePeriod() throws Exception {
    InputStream csv = getClass().getResourceAsStream("/csv/instance-variables-invalid-reference-period.csv");

    ParsingResult<List<ParsingResult<InstanceVariable>>> results = parser.parse(csv, "MacRoman");

    assertThat(results.getParsedObject().get()).hasSize(1);
    ParsingResult<InstanceVariable> firstResult = results.getParsedObject().get().iterator().next();
    assertTrue(firstResult.getParsedObject().isPresent());
    assertThat(firstResult.getMessages()).containsExactly("import.csv.warn.invalidIsoDate.referencePeriodStart",
      "import.csv.warn.invalidIsoDate.referencePeriodEnd");
  }

  @Test
  public void multilineDescriptionWindowsLineBreaks() throws Exception {
    InputStream csv = getClass().getResourceAsStream("/csv/instance-variables-multiline-windows.csv");
    ParsingResult<List<ParsingResult<InstanceVariable>>> results = parser.parse(csv, "MacRoman");
    
    assertThat(results.getParsedObject().get()).hasSize(1);
    InstanceVariable iv = results.getParsedObject().get().iterator().next().getParsedObject().get();    
    String description = iv.getDescription().get("fi");
    
    int expectedLineCount = 5;
    assertThat(description.split("\n")).hasSize(expectedLineCount);
    assertThat(description.indexOf("\r")).isEqualTo(-1);
  }
  
   @Test
  public void multilineDescriptionMacLineBreaks() throws Exception {
    InputStream csv = getClass().getResourceAsStream("/csv/instance-variables-multiline-mac.csv");
    ParsingResult<List<ParsingResult<InstanceVariable>>> results = parser.parse(csv, "MacRoman");
    
    assertThat(results.getParsedObject().get()).hasSize(1);
    InstanceVariable iv = results.getParsedObject().get().iterator().next().getParsedObject().get();
    String description = iv.getDescription().get("fi");
    
    int expectedLineCount = 5;
    assertThat(description.split("\n")).hasSize(expectedLineCount);
    assertThat(description.indexOf("\r")).isEqualTo(-1);
  }
  
  @Test
  public void csvWithKnownUnit() {    
    Unit expectedUnit = a.unit()
            .withId(UUID.randomUUID())
            .withPrefLabel("vuosi")
            .withSymbol("v")
            .build();
    
    when(mockedUnitService.queryBySymbol(eq("v"))).thenReturn(Stream.of(expectedUnit));
    
    InputStream csv = getClass().getResourceAsStream("/csv/instance-variables-unit.csv");
    ParsingResult<List<ParsingResult<InstanceVariable>>> results = parser.parse(csv, "MacRoman");
    ParsingResult<InstanceVariable> firstResult = results.getParsedObject().get().iterator().next();
    
    assertThat(results.getMessages()).isEmpty();
    assertThat(firstResult.getMessages()).isEmpty();
    
    assertThat(results.getParsedObject().get()).hasSize(1);
    InstanceVariable iv = firstResult.getParsedObject().get();    
    Optional<Unit> actualUnit = iv.getUnit();
    
    assertTrue(actualUnit.isPresent());
    assertThat(actualUnit.get().getPrefLabel()).isEqualTo(expectedUnit.getPrefLabel());
    assertThat(actualUnit.get().getSymbol()).isEqualTo(expectedUnit.getSymbol());
  }
  
  @Test
  public void csvWithUnknownUnit() {
    Unit expectedUnit = a.unit()
        .withId(UUID.randomUUID())
        .withPrefLabel("vuosi")
        .withSymbol("v")
        .build();
    
    List<Unit> emptySearchResult = Collections.emptyList();
    when(mockedUnitService.queryBySymbol(eq("v"))).thenReturn(emptySearchResult.stream());
    
    ArgumentCaptor<Unit> captor = ArgumentCaptor.forClass(Unit.class);
    when(mockedUnitService.save(captor.capture())).thenReturn(expectedUnit);
        
    InputStream csv = getClass().getResourceAsStream("/csv/instance-variables-unit.csv");
    ParsingResult<List<ParsingResult<InstanceVariable>>> results = parser.parse(csv, "MacRoman");
    ParsingResult<InstanceVariable> firstResult = results.getParsedObject().get().iterator().next();
    
    Unit actualUnitParameter = captor.getValue();
    
    assertThat(actualUnitParameter.getPrefLabel()).isEqualTo(expectedUnit.getPrefLabel());
    assertThat(actualUnitParameter.getSymbol()).isEqualTo(expectedUnit.getSymbol());
    
    assertThat(results.getMessages()).isEmpty();
    assertThat(results.getParsedObject().get()).hasSize(1);
    assertThat(firstResult.getMessages()).isEmpty();
    
    InstanceVariable iv = firstResult.getParsedObject().get();    
    Optional<Unit> actualUnit = iv.getUnit();
    
    assertTrue(actualUnit.isPresent());
    assertThat(actualUnit.get().getPrefLabel()).isEqualTo(expectedUnit.getPrefLabel());
    assertThat(actualUnit.get().getSymbol()).isEqualTo(expectedUnit.getSymbol());
  }
  
  @Test
  public void csvWithUnknownUnitAndUndefinedLabel() {
    List<Unit> emptySearchResult = Collections.emptyList();
    when(mockedUnitService.queryBySymbol(eq("v"))).thenReturn(emptySearchResult.stream());
    
    InputStream csv = getClass().getResourceAsStream("/csv/instance-variables-unit-no-preflabel.csv");
    ParsingResult<List<ParsingResult<InstanceVariable>>> results = parser.parse(csv, "MacRoman");
    ParsingResult<InstanceVariable> firstResult = results.getParsedObject().get().iterator().next();
    
    assertThat(results.getParsedObject().get()).hasSize(1);
    assertThat(results.getMessages()).isEmpty();
    
    InstanceVariable iv = firstResult.getParsedObject().get();
    Optional<Unit> actualUnit = iv.getUnit();
    
    assertFalse(actualUnit.isPresent());
    assertThat(firstResult.getMessages()).containsExactly("import.csv.warn.missingRequiredValue.unit.prefLabel");

  }
}
