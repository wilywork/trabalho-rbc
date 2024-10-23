window._dadosTabela = [
  [
    "loan_id",
    "no_of_dependents",
    "education",
    "self_employed",
    "income_annum",
    "loan_amount",
    "loan_term",
    "cibil_score",
    "residential_assets_value",
    "commercial_assets_value",
    "luxury_assets_value",
    "bank_asset_value",
    "loan_status",
  ],
  [
    "1",
    "2",
    "graduate",
    "no",
    "9600000",
    "29900000",
    "12",
    "778",
    "2400000",
    "17600000",
    "22700000",
    "8000000",
    "approved",
  ],
  [
    "2",
    "0",
    "not graduate",
    "yes",
    "4100000",
    "12200000",
    "8",
    "417",
    "2700000",
    "2200000",
    "8800000",
    "3300000",
    "rejected",
  ],
  [
    "3",
    "3",
    "graduate",
    "no",
    "9100000",
    "29700000",
    "20",
    "506",
    "7100000",
    "4500000",
    "33300000",
    "12800000",
    "rejected",
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
] as any;

window._informacoesColunas = {
  loan_id: { manter: false, peso: 1, valores: [], saida: false },
  no_of_dependents: {
    manter: true,
    peso: 1,
    valores: [0, 1, 2, 3, 4, 5],
    saida: false,
  },
  education: {
    manter: true,
    peso: 1,
    valores: ["graduate", "not graduate"],
    saida: false,
  },
  self_employed: {
    manter: true,
    peso: 1,
    valores: ["no", "yes"],
    saida: false,
  },
  income_annum: {
    manter: true,
    peso: 1,
    valores: [
      [200000, 2140000],
      [2140000, 4080000],
      [4080000, 6020000],
      [6020000, 7960000],
      [7960000, 9900000],
    ],
    saida: false,
  },
  loan_amount: {
    manter: true,
    peso: 1,
    valores: [
      [300000, 8140000],
      [8140000, 15980000],
      [15980000, 23820000],
      [23820000, 31660000],
      [31660000, 39500000],
    ],
    saida: false,
  },
  loan_term: {
    manter: true,
    peso: 1,
    valores: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    saida: false,
  },
  cibil_score: {
    manter: true,
    peso: 1,
    valores: [
      [300, 420],
      [420, 540],
      [540, 660],
      [660, 780],
      [780, 900],
    ],
    saida: false,
  },
  residential_assets_value: {
    manter: true,
    peso: 1,
    valores: [
      [-100000, 5740000],
      [5740000, 11580000],
      [11580000, 17420000],
      [17420000, 23260000],
      [23260000, 29100000],
    ],
    saida: false,
  },
  commercial_assets_value: {
    manter: true,
    peso: 1,
    valores: [
      [0, 3880000],
      [3880000, 7760000],
      [7760000, 11640000],
      [11640000, 15520000],
      [15520000, 19400000],
    ],
    saida: false,
  },
  luxury_assets_value: {
    manter: true,
    peso: 1,
    valores: [
      [300000, 8080000],
      [8080000, 15860000],
      [15860000, 23640000],
      [23640000, 31420000],
      [31420000, 39200000],
    ],
    saida: false,
  },
  bank_asset_value: {
    manter: true,
    peso: 1,
    valores: [
      [0, 2940000],
      [2940000, 5880000],
      [5880000, 8820000],
      [8820000, 11760000],
      [11760000, 14700000],
    ],
    saida: false,
  },
  loan_status: {
    manter: false,
    peso: 1,
    valores: ["approved", "rejected"],
    saida: true,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

//===================================================================================================================================
//===================================================================================================================================
//===================================================================================================================================
//===================================================================================================================================

import React, { useState, useEffect } from "react";

export function Resolucao() {
  window._informacoesColunas = window.informacoesColunas;
  window._dadosTabela = window.dadosTabela;

  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [relevantCases, setRelevantCases] = useState<any[]>([]);

  // Função para atualizar os inputs
  const handleInputChange = (column: string, value: any) => {
    setInputs((prevState) => ({
      ...prevState,
      [column]: value,
    }));
  };

  // Função para calcular a relevância dos casos
  const calcularRelevancia = () => {
    const casosRelevantes = window._dadosTabela.slice(1).map((linha, index) => {
      let relevancia = 0;

      Object.keys(window._informacoesColunas)
        .filter(
          (coluna) =>
            window._informacoesColunas[coluna].manter &&
            !window._informacoesColunas[coluna].saida
        )
        .forEach((coluna) => {
          const infoColuna = window._informacoesColunas[coluna];
          if (inputs[coluna] !== undefined) {
            const peso = infoColuna.peso;
            let valorTabela = linha[window._dadosTabela[0].indexOf(coluna)];
            let valorInput = inputs[coluna];

            if (Array.isArray(infoColuna.valores?.[0])) {
              const categoria = infoColuna.valores.findIndex(
                ([min, max]: [number, number]) =>
                  valorTabela >= min && valorTabela < max
              );
              valorTabela = categoria;
            } else if (!isNaN(Number(valorTabela))) {
              valorTabela = Number(valorTabela);
            } else {
              valorTabela = infoColuna.valores.indexOf(valorTabela) + 1;
            }

            if (Array.isArray(infoColuna.valores?.[0])) {
              const categoria = infoColuna.valores.findIndex(
                ([min, max]: [number, number]) =>
                  valorInput >= min && valorInput < max
              );
              valorInput = categoria;
            } else if (!isNaN(Number(valorInput))) {
              valorInput = Number(valorInput);
            } else {
              valorInput = infoColuna.valores.indexOf(valorInput) + 1;
            }
            relevancia +=
              peso *
              (1 -
                Math.abs(Number(valorTabela) - Number(valorInput)) /
                  infoColuna.valores.length);
          }
        });

      return { linha, relevancia };
    });

    casosRelevantes.sort((a, b) => b.relevancia - a.relevancia);

    // Retorna os 50 casos mais relevantes
    setRelevantCases(casosRelevantes.slice(0, 100));
  };

  useEffect(() => {
    calcularRelevancia(); // Recalcula relevância sempre que os inputs mudam
  }, [inputs]);

  return (
    <div className="resolucao-container">
      <h3>Tabela de Casos com Raciocínio Baseado em Casos</h3>
      <table>
        <thead>
          <tr>
            {Object.keys(window._informacoesColunas)
              .filter(
                (coluna) =>
                  window._informacoesColunas[coluna].manter &&
                  !window._informacoesColunas[coluna].saida
              )
              .map((coluna) => (
                <th key={coluna}>{coluna}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {Object.keys(window._informacoesColunas)
              .filter(
                (coluna) =>
                  window._informacoesColunas[coluna].manter &&
                  !window._informacoesColunas[coluna].saida
              )
              .map((coluna) => (
                <td key={coluna}>
                  <input
                    type="text"
                    value={inputs[coluna] || ""}
                    onChange={(e) => handleInputChange(coluna, e.target.value)}
                  />
                </td>
              ))}
          </tr>
        </tbody>
      </table>

      <h3>Casos Mais Relevantes</h3>
      <table>
        <thead>
          <tr>
            {window._dadosTabela[0]
              // .filter(
              //   (coluna) =>
              //     window._informacoesColunas[coluna].manter &&
              //     !window._informacoesColunas[coluna].saida
              // )
              .map((coluna) => (
                <th key={coluna}>{coluna}</th>
              ))}
            <th>Similaridade</th>
          </tr>
        </thead>
        <tbody>
          {relevantCases.map((caso, index) => (
            <tr key={index}>
              {caso.linha
                // .filter((_: any, idx: number) => {
                //   const coluna = window._dadosTabela[0][idx];
                //   return (
                //     window._informacoesColunas[coluna].manter &&
                //     !window._informacoesColunas[coluna].saida
                //   );
                // })
                .map((valor: any, idx: number) => (
                  <td key={idx}>{valor}</td>
                ))}
              <td>{caso.relevancia.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
