import { useState } from "react";
import "./style.css"; // Adicione um arquivo de estilo

export function FileImport({ onFileLoad, setShowResolucao }) {
  const [fileContent, setFileContent] = useState(null);
  const [fileType, setFileType] = useState("");
  const [error, setError] = useState(false);

  const handleReset = () => {
    setFileContent(null);
    setShowResolucao(false);
    setFileType("");
    setError(false);
    onFileLoad(null); // Limpa os dados no componente pai
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      setFileType(file.type);

      reader.onload = (e) => {
        const content = e.target.result;
        setFileContent(content);
        setError(false);
        onFileLoad(content); // Passa o conteúdo do arquivo para o parent component
      };

      if (
        file.type === "text/csv" ||
        file.type === "text/xml" ||
        file.type === "application/xml"
      ) {
        reader.readAsText(file);
      } else {
        setError(true);
        setFileContent(null);
        onFileLoad(null); // Reseta os dados no parent component
      }
    }
  };

  return (
    <div className="file-import-container">
      {fileContent ? ( // Exibe o botão Resetar se fileContent tiver algum valor
        <button onClick={handleReset}>Resetar</button>
      ) : (
        <>
          <h2>Upload de Arquivo (XML ou CSV)</h2>
          <input type="file" accept=".csv, .xml" onChange={handleFileUpload} />
          <div
            className={`status ${
              fileContent ? "success" : error ? "error" : ""
            }`}
          >
            {/* ... (mensagens de status) */}
          </div>
        </>
      )}
    </div>
  );
}
