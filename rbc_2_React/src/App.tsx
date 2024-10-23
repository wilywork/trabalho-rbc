import { useEffect, useState } from "react";
import { FileImport } from "./components/FileImport";
import { IndexSelect } from "./components/IndexSelect";
import { DataSummary } from "./components/DataSummary";
import { Results } from "./components/Results";
import { Resolucao } from "./components/Resolucao"; // Importa o novo componente Resolucao
import "./style.css";

export function App() {
  const [fileContent, setFileContent] = useState(null);
  const [preferences, setPreferences] = useState({});
  const [targetVariable, setTargetVariable] = useState(""); // Variável alvo
  const [updatedPreferences, setUpdatedPreferences] = useState({}); // Atualiza diretamente as preferências existentes
  const [activeTab, setActiveTab] = useState("preferences"); // Aba ativa (preferências ou variáveis removidas)
  const [showDataSummary, setShowDataSummary] = useState(false); // Controla a exibição do componente DataSummary
  const [showResults, setShowResults] = useState(false); // Controla a exibição do componente Results
  const [showResolucao, setShowResolucao] = useState(false); // Controla a exibição do componente Resolucao
  const [weightValues, setWeightValues] = useState({}); // Armazena os valores de pesos preenchidos pelo usuário
  const [distributionValues, setDistributionValues] = useState({}); // Armazena a distribuição das variáveis

  useEffect(() => {
    // Resetar variável alvo ao mudar preferências
    setTargetVariable("");
    setWeightValues({}); // Limpa os valores de peso
    // Filtra as colunas que não estão marcadas como "remover"
    const filteredPreferences = Object.entries(preferences)
      .filter(([column, action]) => action !== "remover")
      .reduce((acc, [column, action]) => {
        acc[column] = action;
        return acc;
      }, {});

    setUpdatedPreferences(filteredPreferences);
  }, [preferences]);

  const handleFileLoad = (content) => {
    setFileContent(content); // Define o conteúdo do arquivo
  };

  const handlePreferencesChange = (updatedPreferences) => {
    setPreferences(updatedPreferences); // Atualiza as preferências para as colunas
  };

  const handleTargetVariableChange = (column) => {
    setTargetVariable(column); // Define a variável alvo, permitindo apenas uma
    setWeightValues((prevValues) => ({
      ...prevValues,
      [column]: "", // Limpa o valor de peso da nova variável alvo
    }));
  };

  const getRemovedColumns = () => {
    // Retorna todas as colunas que foram removidas (definidas como "remover")
    return Object.entries(preferences)
      .filter(([column, action]) => action === "remover")
      .map(([column]) => column);
  };

  const handleNextClick = () => {
    const hasSaidaTrue = Object.values(window.informacoesColunas).some(
      (coluna) => coluna.saida === true || (coluna.manter && coluna.peso > 0)
    );
    if (hasSaidaTrue) {
      setShowResolucao(true);
    } else {
      alert("Por favor, selecione as preferências antes de prosseguir.");
      setShowResolucao(false);
    }
  };

  const handleGoBackToDataSummary = () => {
    // Volta ao componente DataSummary
    setShowResults(false);
    setShowDataSummary(true);
  };

  const handleProceedToResults = (weights) => {
    // Exibe o componente Results, salvando os valores dos pesos
    setWeightValues(weights); // Salva os valores dos pesos preenchidos
    setShowDataSummary(false);
    setShowResults(true);
  };

  const handleProceedToResolucao = (distributions) => {
    // Transição para o componente Resolucao
    setDistributionValues(distributions); // Salva as distribuições fornecidas
    setShowResults(false);
    setShowResolucao(true);
  };

  const handleGoBackToPreferences = (weights) => {
    // Volta ao componente anterior (preferências), resetando os valores dos pesos
    setWeightValues({}); // Limpa os valores dos pesos ao voltar para o App
    setShowDataSummary(false);
  };

  if (showResolucao) {
    // Exibe o componente Resolucao
    return (
      <div className="app-container">
        <FileImport onFileLoad={handleFileLoad} setShowResolucao={setShowResolucao} />
        <div className="main-content">
          {fileContent && (
            <Resolucao
              preferences={updatedPreferences}
              targetVariable={targetVariable}
              weightValues={weightValues}
              distributionValues={distributionValues}
              fileContent={fileContent} // Passa o conteúdo do arquivo para o Resolucao
            />
          )}
        </div>
      </div>
    );
  }

  if (showResults) {
    // Exibe o componente Results
    return (
      <Results
        onGoBack={handleGoBackToDataSummary}
        onProceedToResolucao={handleProceedToResolucao}
        columnValues={weightValues}
      />
    );
  }

  if (showDataSummary) {
    // Exibe o componente DataSummary
    return (
      <DataSummary
        targetVariable={targetVariable}
        updatedPreferences={updatedPreferences}
        onGoBack={handleGoBackToPreferences} // Função para voltar ao resumo
        onProceed={handleProceedToResults} // Função para prosseguir para os resultados
        previousValues={weightValues} // Passa os valores de pesos previamente inseridos
      />
    );
  }

  return (
    <div className="app-container">
      <FileImport onFileLoad={handleFileLoad} />
      <div className="main-content">
        {fileContent && (
          <IndexSelect
            fileContent={fileContent}
            onPreferencesChange={handlePreferencesChange}
            preferences={updatedPreferences} // Passa as preferências atualizadas para o IndexSelect
          />
        )}
      </div>
      {fileContent && (
        <div className="next-button-container">
          <button className="next-button" onClick={handleNextClick}>
            Próximo
          </button>
        </div>
      )}
    </div>
  );
}
