import React, { useState, useEffect } from "react";
import "./style.css";

export function DataSummary({ targetVariable, updatedPreferences, onGoBack, onProceed, previousValues }) {
  const [columnValues, setColumnValues] = useState({});

  // Função para verificar se o valor é um número válido
  const isValidNumber = (value) => value !== "" && !isNaN(value) && Number(value) > 0;

  // Inicialização: preenche todas as colunas com valores vazios e, em seguida, remove a variável alvo
  useEffect(() => {
    const initialValues = Object.keys(updatedPreferences).reduce((acc, column) => {
      acc[column] = ""; // Inicializa todas as colunas com valores vazios
      return acc;
    }, {});

    // Se existem valores anteriores, restauramos esses valores, exceto a variável alvo
    if (previousValues && Object.keys(previousValues).length > 0) {
      Object.keys(previousValues).forEach((column) => {
        initialValues[column] = previousValues[column] || ""; // Restaura os valores anteriores ou mantém vazio
      });
    }

    // Removemos a variável alvo dos valores de coluna
    delete initialValues[targetVariable];

    setColumnValues(initialValues); // Define o estado com os valores inicializados
  }, [updatedPreferences, previousValues, targetVariable]);

  // Atualiza os valores quando o input muda
  const handleInputChange = (e, column) => {
    const value = e.target.value;
    setColumnValues((prevValues) => ({
      ...prevValues,
      [column]: value, // Atualiza o valor da coluna correspondente
    }));
  };

  // Função de validação para verificar se todos os pesos (exceto o alvo) estão preenchidos
  const validateWeights = () => {
    return Object.keys(columnValues)
      .every((column) => isValidNumber(columnValues[column])); // Verifica se todos os campos são números válidos
  };

  const allWeightsFilled = validateWeights(); // Valida quando os valores mudam

  return (
    <div className="data-summary-container">
      {/* Botão de Voltar */}
      <button className="back-button" onClick={() => onGoBack(columnValues)}>
        Voltar
      </button>

      <h3>Resumo dos Dados Selecionados</h3>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="summary-item">
          <strong>Variável Alvo:</strong> {targetVariable ? targetVariable : "Nenhuma variável alvo definida"}
        </div>

        {/* Exibe o título "Pesos" acima dos inputs numéricos */}
        <div className="summary-item" style={{ marginTop: "15px" }}>
          <strong>Pesos</strong>
        </div>
      </div>

      {/* Exibe as colunas mantidas com inputs de número */}
      <div className="summary-item">
        <ul>
          {Object.keys(columnValues).map((column) => (
            <li key={column} className="column-item">
              <span>{column}</span>
              <input
                type="number" // Input de número
                value={columnValues[column] || ""}
                onChange={(e) => handleInputChange(e, column)}
                className="number-input"
                placeholder="Peso"
                style={{ textAlign: "center" }}
                min="0" // Valor mínimo permitido é 0
                step="0.01" // Precisão de 0.01 para aceitar números decimais
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Botão "Próximo" que leva ao componente Results */}
      <div className="next-button-container">
        <button
          className="next-button"
          onClick={() => onProceed(columnValues)} // Passa os valores preenchidos ao prosseguir
          disabled={!allWeightsFilled} // Desabilita o botão se os pesos não estiverem preenchidos com números válidos
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
