import React, { useState, useEffect } from "react";
import "./style.css";

export function Results({ onGoBack, onProceedToResolucao, columnValues = {} }) {
  const [distributions, setDistributions] = useState({});

  // Inicializa as distribuições com valores vazios, apenas se columnValues existir
  useEffect(() => {
    if (Object.keys(columnValues).length > 0) {
      const initialDistributions = Object.keys(columnValues).reduce((acc, column) => {
        acc[column] = ""; // Inicializa as distribuições como vazias
        return acc;
      }, {});
      setDistributions(initialDistributions); // Define o estado com as distribuições inicializadas
    }
  }, [columnValues]);

  // Atualiza o valor da distribuição quando o input muda
  const handleInputChange = (e, column) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(value) && Number(value) >= 0 && Number.isInteger(Number(value)))) {
      setDistributions((prevDistributions) => ({
        ...prevDistributions,
        [column]: value, // Atualiza o valor da distribuição correspondente
      }));
    }
  };

  // Função para verificar se todas as distribuições são números inteiros válidos
  const allDistributionsFilled = Object.keys(distributions).every(
    (column) => distributions[column] !== "" && Number.isInteger(Number(distributions[column])) && Number(distributions[column]) >= 0
  );

  return (
    <div className="results-container">
      <button className="back-button" onClick={onGoBack}>
        Voltar
      </button>
      <h2>Distribuição das Variáveis</h2>
      <p>Abaixo, defina a distribuição desejada para cada coluna:</p>

      {/* Exibe as colunas com inputs para as distribuições */}
      <div className="distributions-container">
        <ul>
          {Object.keys(columnValues).length > 0 ? (
            Object.keys(columnValues).map((column) => (
              <li key={column} className="distribution-item">
                <span>{column}</span>
                <input
                  type="number" // Input de número para distribuições
                  value={distributions[column] || ""}
                  onChange={(e) => handleInputChange(e, column)}
                  className="number-input"
                  placeholder="Distribuição"
                  min="0" // Aceita apenas números inteiros positivos
                />
              </li>
            ))
          ) : (
            <p>Nenhuma variável foi selecionada.</p>
          )}
        </ul>
      </div>

      {/* Botão para prosseguir, habilitado apenas se todas as distribuições forem válidas */}
      <div className="next-button-container">
        <button
          className="next-button"
          disabled={!allDistributionsFilled}
          onClick={() => onProceedToResolucao(distributions)} // Passa as distribuições para o próximo componente
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}
