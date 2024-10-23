import { useState, useEffect, ChangeEvent } from "react";
import Papa from "papaparse";
import "./style.css";

// Declarando a variável global no window
declare global {
  interface Window {
    dadosTabela: string[][];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _dadosTabela: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _informacoesColunas: any;
    informacoesColunas: Record<
      string,
      {
        manter: boolean;
        peso: number;
        valores: (string | number | [number, number])[];
        saida: boolean;
      }
    >;
  }
}

// Inicializa a variável global
window.informacoesColunas = window.informacoesColunas || {};

// Tipagem das propriedades do componente
interface IndexSelectProps {
  fileContent: string;
  onPreferencesChange: (preferences: Record<string, string>) => void;
}

// Função utilitária para verificar se o valor é numérico
const isNumeric = (value: string): boolean => {
  return !isNaN(Number(value));
};

// Função utilitária para categorizar valores em 5 divisões
const categorizeValues = (
  values: number[],
  numCategories: number = 5
): [number, number][] => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const interval = (max - min) / numCategories;

  const categories: [number, number][] = [];
  for (let i = 0; i < numCategories; i++) {
    const lowerBound = min + i * interval;
    const upperBound = i === numCategories - 1 ? max : lowerBound + interval;
    categories.push([lowerBound, upperBound]);
  }
  return categories;
};

export function IndexSelect({
  fileContent,
  onPreferencesChange,
}: IndexSelectProps) {
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [currentColumn, setCurrentColumn] = useState<string>("");
  const [indexPreferences, setIndexPreferences] = useState<
    Record<string, string>
  >({});
  const [quant, setQuant] = useState<Record<string, number>>({});
  const [inputValue, setInputValue] = useState<Record<string, number>>({});
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [isColumnNumeric, setIsColumnNumeric] = useState<
    Record<string, boolean>
  >({});
  const [categorizedData, setCategorizedData] = useState<
    Record<string, [number, number][]>
  >({});
  const [distinctValues, setDistinctValues] = useState<
    Record<string, string[] | number[] | [number, number][]>
  >({});
  const [isSaida, setIsSaida] = useState<Record<string, boolean>>({}); // Estado para controlar a "Coluna Alvo"

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    column: string
  ) => {
    const value = Number(event.target.value);

    if (!isNaN(value) && value >= 1) {
      setInputValue((prev) => ({
        ...prev,
        [column]: value,
      }));

      setQuant((prev) => ({
        ...prev,
        [column]: value,
      }));

      if (window.informacoesColunas[column]) {
        window.informacoesColunas[column].valores = distinctValues[
          column
        ].slice(0, value);
      }
    }
  };

  const processCSV = (content: string) => {
    Papa.parse(content, {
      complete: (result) => {
        let data = result.data as string[][];
        if (data.length > 0) {
          data = data.filter((row) => row.length > 0);
          data = data.map((row) =>
            row.map((cell) => cell.toLocaleLowerCase().trim())
          );
          window.dadosTabela = data;
          setCsvData(data);
          const headers = data[0];
          setCurrentColumn(headers[0]);

          const initialPreferences: Record<string, string> = {};
          const initialQuant: Record<string, number> = {};
          const numericStatus: Record<string, boolean> = {};
          const distinctValuesList: Record<string, string[] | number[] | [number, number][] | []> = {};

          headers.forEach((header, colIndex) => {
            initialPreferences[header] = initialPreferences[header] || "manter";

            const columnValues = data.slice(1).map((row) => row[colIndex]);
            const isNumericColumn = columnValues.every((value) =>
              isNumeric(value)
            );
            numericStatus[header] = isNumericColumn;

            if (isNumericColumn) {
              const distinctValues = Array.from(
                new Set(columnValues.map(Number))
              ).sort((a, b) => a - b);
              if (distinctValues.length <= 50) {
                initialQuant[header] = distinctValues.length;
                distinctValuesList[header] = distinctValues;
              } else {
                setCategorizedData((prevCategorized) => ({
                  ...prevCategorized,
                  [header]: categorizeValues(distinctValues, 5),
                }));
                initialQuant[header] = 5;
                distinctValuesList[header] = categorizeValues(distinctValues, 5);
              }
            } else {
              const distinct = Array.from(new Set(columnValues)).sort();
              distinctValuesList[header] = distinct;
              initialQuant[header] = distinct.length;
            }

            window.informacoesColunas[header] = {
              manter: true,
              peso: 0,
              valores: distinctValuesList[header] || [],
              saida: false,
            };
          });

          setQuant(initialQuant);
          setIsColumnNumeric(numericStatus);
          setDistinctValues(distinctValuesList);
          setIndexPreferences(initialPreferences);
          onPreferencesChange(initialPreferences);

          // Inicializa o estado de "saida" de acordo com a variável global
          const initialSaidaState: Record<string, boolean> = {};
          Object.keys(window.informacoesColunas).forEach((column) => {
            initialSaidaState[column] = window.informacoesColunas[column].saida;
          });
          setIsSaida(initialSaidaState); // Inicializa o estado com os valores de "saida"
        }
      },
      header: false,
      skipEmptyLines: true,
    });
  };

  useEffect(() => {
    if (fileContent) {
      processCSV(fileContent);
    }
  }, [fileContent]);

  const handleRadioChange = (column: string, action: string) => {
    const manter = action === "manter";
    setIndexPreferences((prevPreferences) => {
      const updatedPreferences = {
        ...prevPreferences,
        [column]: action,
      };
      onPreferencesChange(updatedPreferences);

      if (window.informacoesColunas[column]) {
        window.informacoesColunas[column].manter = manter;
      }

      return updatedPreferences;
    });
  };

  const handleSaidaChange = (column: string, isChecked: boolean) => {
    setIsSaida((prevState) => ({
      ...prevState,
      [column]: isChecked,
    }));

    if (window.informacoesColunas[column]) {
      window.informacoesColunas[column].saida = isChecked;
    }
  };

  const handleWeightChange = (
    event: ChangeEvent<HTMLInputElement>,
    column: string
  ) => {
    const value = Number(event.target.value);
    if (!isNaN(value) && value >= 0) {
      setWeights((prev) => ({
        ...prev,
        [column]: value,
      }));

      if (window.informacoesColunas[column]) {
        window.informacoesColunas[column].peso = value;
      }
    }
  };

  const moveDistinctValue = (
    column: string,
    fromIndex: number,
    toIndex: number
  ) => {
    //@ts-expect-error prevDistinctValues
    setDistinctValues((prevDistinctValues) => {
      const updatedValues = [
        ...(prevDistinctValues[column] as string[] | number[]),
      ];
      const [movedValue] = updatedValues.splice(fromIndex, 1);
      updatedValues.splice(toIndex, 0, movedValue);

      if (window.informacoesColunas[column]) {
        window.informacoesColunas[column].valores = updatedValues;
      }

      return {
        ...prevDistinctValues,
        [column]: updatedValues,
      };
    });
  };

  const handleColumnClick = (header: string) => {
    setCurrentColumn(header);
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h3>Colunas</h3>
        {csvData.length > 0 && (
          <div className="sidebar-column-navigation">
            {csvData[0].map((header, index) => (
              <div
                key={index}
                onClick={() => handleColumnClick(header)}
                className={`sidebar-column-item ${
                  currentColumn === header ? "active" : ""
                }`}
              >
                {header}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="content">
        {csvData.length > 0 && (
          <>
            <div>
              <h4>{currentColumn}</h4>
              <div className="preferences">
                <label>
                  <input
                    type="radio"
                    name={`preference-${currentColumn}`}
                    value="manter"
                    checked={indexPreferences[currentColumn] === "manter"}
                    onChange={() => handleRadioChange(currentColumn, "manter")}
                  />
                  Manter
                </label>
                <label style={{ marginLeft: "10px" }}>
                  <input
                    type="radio"
                    name={`preference-${currentColumn}`}
                    value="remover"
                    checked={indexPreferences[currentColumn] === "remover"}
                    onChange={() => handleRadioChange(currentColumn, "remover")}
                  />
                  Remover
                </label>
              </div>

              <div style={{ marginTop: "10px" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={isSaida[currentColumn] === true}
                    onChange={(e) =>
                      handleSaidaChange(currentColumn, e.target.checked)
                    }
                  />
                  Coluna Alvo
                </label>
              </div>

              {indexPreferences[currentColumn] === "manter" && (
                <div style={{ marginTop: "10px" }}>
                  <label>
                    Peso:{" "}
                    <input
                      type="number"
                      name={`peso-${currentColumn}`}
                      value={weights[currentColumn] || ""}
                      onChange={(e) => handleWeightChange(e, currentColumn)}
                      min={0}
                    />
                  </label>
                </div>
              )}
            </div>

            <div style={{ textAlign: "center", margin: "20px" }}>
              {isColumnNumeric[currentColumn] ? (
                <>
                  {categorizedData[currentColumn] ? (
                    <div></div>
                  ) : distinctValues[currentColumn] ? (
                    <div>
                      <h5>Valores distintos para {currentColumn}:</h5>
                      <table className="styled-table">
                        <thead>
                          <tr>
                            <th>Valores</th>
                          </tr>
                        </thead>
                        <tbody>
                          {distinctValues[currentColumn].map((value, index) => (
                            <tr key={index}>
                              <td>{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <>
                      Quantidade de amostras para {currentColumn}
                      <input
                        type="number"
                        name={`amostragemQuant-${currentColumn}`}
                        id={`amostragemQuant-${currentColumn}`}
                        min={1}
                        value={inputValue[currentColumn] || 5}
                        onChange={(e) => handleInputChange(e, currentColumn)}
                      />
                    </>
                  )}
                </>
              ) : (
                <p>
                  Amostras (valores distintos) para {currentColumn}:{" "}
                  {quant[currentColumn]}
                </p>
              )}
            </div>

            {!isColumnNumeric[currentColumn] &&
              distinctValues[currentColumn] && (
                <div>
                  <h5>Valores distintos para {currentColumn}:</h5>
                  <ul>
                    {distinctValues[currentColumn].map((value, index) => (
                      <li key={index}>
                        {value}
                        <button
                          onClick={() =>
                            moveDistinctValue(currentColumn, index, index - 1)
                          }
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          onClick={() =>
                            moveDistinctValue(currentColumn, index, index + 1)
                          }
                          disabled={
                            index === distinctValues[currentColumn].length - 1
                          }
                        >
                          ↓
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            <div className="table-container">
              {categorizedData[currentColumn] && (
                <div className="table-item">
                  <h5>Faixas categorizadas:</h5>
                  <ul>
                    {categorizedData[currentColumn].map((range, index) => (
                      <li key={index}>
                        Faixa {index + 1}: {range[0].toFixed(2)} -{" "}
                        {range[1].toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
