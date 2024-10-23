import tkinter as tk
from tkinter import filedialog, messagebox, simpledialog
import pandas as pd
import numpy as np


# Mapeamento de nomes de colunas originais para nomes traduzidos
translate_columns = {
    "loan_id": "id",
    " no_of_dependents": "numero_de_dependentes",
    " education": "educacao",
    " self_employed": "autonomo",
    " income_annum": "renda_anual",
    " loan_amount": "valor_emprestimo",
    " loan_term": "prazo_emprestimo",
    " cibil_score": "pontuacao_cibil",
    " residential_assets_value": "valor_patrimonio_residencial",
    " commercial_assets_value": "valor_patrimonio_comercial",
    " luxury_assets_value": "valor_patrimonio_luxo",
    " bank_asset_value": "valor_patrimonio_banco",
    " loan_status": "aprovado"
}

global columns
columns = ['numero_de_dependentes', 'educacao', 'autonomo', 'renda_anual',
           'valor_emprestimo', 'prazo_emprestimo', 'pontuacao_cibil',
           'valor_patrimonio_residencial', 'valor_patrimonio_comercial',
           'valor_patrimonio_luxo', 'valor_patrimonio_banco']

def carregar_dados():
    caminho_arquivo = filedialog.askopenfilename(filetypes=[("Excel files", "*.xlsx;*.xls")])
    if caminho_arquivo:
        try:
            global df
            df = pd.read_excel(caminho_arquivo)
            df.rename(columns=translate_columns, inplace=True)
            df['educacao'] = df['educacao'].replace({' Not Graduate': 0, ' Graduate': 1})
            df['autonomo'] = df['autonomo'].replace({' No': 0, ' Yes': 1})
            df['aprovado'] = df['aprovado'].replace({' Rejected': 0, ' Approved': 1})
            df.drop(['id'], axis=1, inplace=True)
            atualizar_texto()
        except Exception as e:
            messagebox.showerror("Erro", f"Erro ao ler o arquivo: {e}")

def atualizar_texto():
    try:
        num_amostras = int(entry_amostras.get())
        if num_amostras < 1 or num_amostras > len(df):
            messagebox.showwarning("Atenção", f"O número deve estar entre 1 e {len(df)}.")
            return
    except ValueError:
        messagebox.showwarning("Atenção", "Insira um número válido.")
        return

    text_area.delete(1.0, tk.END)
    text_area.insert(tk.END, str(df.sample(num_amostras)))

def calcular_pesos_variaveis():
    escolha = messagebox.askquestion("Escolha", "Você deseja calcular os pesos de forma automática?")
    if escolha == 'yes':
        calcular_pesos_automatico()
    else:
        calcular_pesos_manual()

def calcular_pesos_automatico():
        y = df['aprovado']
        X = df.drop(columns='aprovado')
        correlation = pd.concat([y, X], axis=1).corr()
        correlation_tar = correlation['aprovado'].drop('aprovado')
        weight = correlation_tar.abs() / correlation_tar.abs().sum()
        global pesos
        pesos = weight
        

        text_area.delete(1.0, tk.END)
        text_area.insert(tk.END, "Pesos calculados (Automático):\n")
        for coluna, valor in weight.items():
            text_area.insert(tk.END, f"- {coluna}: {valor:.4f}\n")
        
        botao_voltar.grid(row=4, column=0, padx=5, pady=5)

def calcular_pesos_manual():
        text_area.delete(1.0, tk.END)
        text_area.insert(tk.END, "Insira os pesos manualmente:\n")
        pesos = {}
        for coluna in df.columns:
            if coluna != 'aprovado':
                valor = simpledialog.askfloat("Peso", f"Insira o peso para a variável '{coluna}':")
                if valor is not None:  # Verifica se o usuário pressionou Cancelar
                    pesos[coluna] = valor
        
        text_area.insert(tk.END, "Pesos calculados (Manual):\n")
        for coluna, valor in pesos.items():
            text_area.insert(tk.END, f"- {coluna}: {valor:.4f}\n")

        botao_voltar.grid(row=4, column=0, padx=5, pady=5)

def calcular_pesos_similaridade():
        global d_by
        d_by = []
        nomes_colunas = []
        for coluna in df.columns:
            if coluna != 'aprovado':
                intervalos = simpledialog.askinteger("Intervalos", f"Insira o número de intervalos para '{coluna}':")
                if intervalos is not None and intervalos > 0:
                    d_by.append(intervalos)
                    nomes_colunas.append(coluna)

        # Gerar os intervalos
        global intervalos_dict
        intervalos_dict = {}
        for coluna, intervalos in zip(columns, d_by):
            min_value = df[coluna].min()
            max_value = df[coluna].max()
            intervalo_tamanho = (max_value - min_value) / intervalos  # Calculando o tamanho de cada intervalo

            # Gerando os intervalos
            intervalos_coluna = []
            for i in range(intervalos):

                lower_bound = min_value + i * intervalo_tamanho
                upper_bound = min_value + (i + 1) * intervalo_tamanho
                intervalos_coluna.append(f'{lower_bound:.0f}-{upper_bound:.0f}')  # Formatando para inteiro

            # Adicionando os intervalos ao dicionário
            intervalos_dict[coluna] = intervalos_coluna
        
        mostrar_intervalos(intervalos_dict)

        pesos_dict = calcular_pesos(nomes_colunas, d_by)

        text_area.delete(1.0, tk.END)
        text_area.insert(tk.END, "Pesos Calculados:\n")
        for coluna, pesos in pesos_dict.items():
            text_area.insert(tk.END, f"- {coluna}:\n")
            for row in pesos:
                text_area.insert(tk.END, f"  {row}\n")

        botao_voltar.grid(row=4, column=0, padx=5, pady=5)

def calcular_pesos(nomes_colunas, d_by):
    global pesos_dict
    pesos_dict = {}
    for col_index, num_intervals in enumerate(d_by):
        pesos_matrix = []

        for i in range(num_intervals):
            row = []
            for j in range(num_intervals):
                # Cálculo do peso
                peso = 1 - abs(i - j) / num_intervals
                row.append(round(peso, 2))  # Arredondando para duas casas decimais
            pesos_matrix.append(row)

        # Adicionando a matriz de pesos ao dicionário com o nome da coluna
        pesos_dict[nomes_colunas[col_index]] = pesos_matrix

    return pesos_dict

def mostrar_intervalos(intervalos_dict):
    janela_intervalos = tk.Toplevel(root)
    janela_intervalos.title("Intervalos Gerados")

    text_area_intervalos = tk.Text(janela_intervalos, width=80, height=20)
    text_area_intervalos.pack(expand=True, fill='both')

    for coluna, intervalos in intervalos_dict.items():
        text_area_intervalos.insert(tk.END, f"{coluna}:\n")
        for intervalo in intervalos:
            text_area_intervalos.insert(tk.END, f"- {intervalo}\n")
        text_area_intervalos.insert(tk.END, "\n")  # Linha em branco entre as variáveis

    botao_fechar = tk.Button(janela_intervalos, text="Fechar", command=janela_intervalos.destroy)
    botao_fechar.pack(pady=5)

def get_interval_index(valor, intervalos):
    for i, intervalo in enumerate(intervalos):
        partes = intervalo.split('-')

        try:
            # Converter os valores mínimos e máximos e tratar valores negativos
            minimo = max(0, float(partes[0]))  # Substituir negativos por 0
            maximo = float(partes[1])

            if minimo <= valor <= maximo:
                return i
        except (ValueError, IndexError):
            print(f"Aviso: Intervalo mal formado ignorado: '{intervalo}'")
            continue

    print(f"Aviso: Valor {valor} não está em nenhum intervalo: {intervalos}")
    return None

def calcular_similaridade_com_linha(linha, dado_entrada, tabelas_similaridade, intervalos_dict, pesos):
    similaridade_total = 0
    soma_pesos = 0

    for atributo, peso in pesos.items():
        valor_entrada = dado_entrada[atributo]
        valor_referencia = linha[atributo]

        tabela_similaridade = tabelas_similaridade.get(atributo)
        intervalos = intervalos_dict.get(atributo)

        # Obter os índices nos intervalos
        indice_entrada = get_interval_index(valor_entrada, intervalos)
        indice_referencia = get_interval_index(valor_referencia, intervalos)
        '''
        print(f"Atributo: {atributo}")
        print(f"  Valor de entrada: {valor_entrada}")
        print(f"  Valor de referência: {valor_referencia}")
        print(f"  Índice de entrada: {indice_entrada}")
        print(f"  Índice de referência: {indice_referencia}")
        '''

        if indice_entrada is not None and indice_referencia is not None:
            similaridade = tabela_similaridade[indice_entrada][indice_referencia]
            #print(f"  Similaridade: {similaridade}")

            calculo_parcial = similaridade * peso
            similaridade_total += calculo_parcial
            soma_pesos += peso

            #print(f"  Cálculo parcial (similaridade * peso): {similaridade} * {peso} = {calculo_parcial}")
        else:
            print(f"  Índices inválidos para o atributo '{atributo}'.")

    similaridade_final = (similaridade_total / soma_pesos) * 100 if soma_pesos > 0 else 0
    #print(f"Similaridade total: {similaridade_final}\n")

    return similaridade_final

def adicionar_similaridade_ao_dataframe():
    df['similaridade'] = df.apply(lambda linha: calcular_similaridade_com_linha(linha, dado_entrada_res, pesos_dict, intervalos_dict, pesos), axis=1)
    return df
    
    
def res():
    global novo_df
    novo_df = adicionar_similaridade_ao_dataframe()
    novo_df = pd.DataFrame(novo_df)
    novo_df.sort_values('similaridade', ascending=False , inplace=True)
    text_area.delete(1.0, tk.END)
    text_area.insert(tk.END, str(novo_df.head()))
    messagebox.showinfo("Resultado",f"A chance desse usuario {np.where(novo_df['aprovado'].iloc[0] == 1, "Obter","Não obter" )} um empréstimo é de {np.round(novo_df.sort_values('similaridade',ascending=False)['similaridade'].iloc[0],2)}%")
    caminho_arquivo = filedialog.asksaveasfilename(defaultextension=".xlsx",
                                                     filetypes=[("Excel files", "*.xlsx;*.xls")])
    print(novo_df.sort_values('aprovado',ascending=False)['aprovado'].iloc[0])
    novo_df.to_excel(caminho_arquivo, index=False)
    
def voltar():
    botao_voltar.grid_forget()
    text_area.delete(1.0, tk.END)
    atualizar_texto()

def abrir_tela_resposta():
    # Função para abrir a nova tela de resposta
    global janela_resposta
    janela_resposta = tk.Toplevel(root)
    janela_resposta.title("Tela de Resposta")

    # Botão para carregar o Excel
    botao_carregar_resposta = tk.Button(janela_resposta, text="Carregar Excel", command=carregar_excel_resposta)
    botao_carregar_resposta.pack(pady=10)

    botao_carregar_resposta = tk.Button(janela_resposta, text="Calcular similaridade", command=res)
    botao_carregar_resposta.pack(pady=10)

    # Área de texto para mostrar resultados
    global text_area_resposta
    text_area_resposta = tk.Text(janela_resposta, width=80, height=20)
    text_area_resposta.pack(expand=True, fill='both')

def carregar_excel_resposta():
    text_area.delete(1.0, tk.END)
    caminho_arquivo = filedialog.askopenfilename(filetypes=[("Excel files", "*.xlsx;*.xls")])
    if caminho_arquivo:
            global dado_entrada
            global dado_entrada_res
            dado_entrada = pd.read_excel(caminho_arquivo)
            dado = dado_entrada.iloc[0]
            dado_entrada_res = dado.to_dict()
            text_area.insert(tk.END, str(dado_entrada))

def mostrar_resultados(df_atualizado):
    text_area_resposta.delete(1.0, tk.END)
    text_area_resposta.insert(tk.END, "Resultados da Similaridade:\n")
    text_area_resposta.insert(tk.END, str(df_atualizado))

# Criando a interface gráfica
root = tk.Tk()
root.title("Calculadora de Similaridade")

frame = tk.Frame(root)
frame.pack(padx=10, pady=10)

# Campo para número de amostras
label_amostras = tk.Label(frame, text="Número de Amostras:")
label_amostras.grid(row=0, column=0, padx=5, pady=5)

entry_amostras = tk.Entry(frame)
entry_amostras.grid(row=0, column=1, padx=5, pady=5)
entry_amostras.bind("<Return>", lambda event: atualizar_texto())

# Botões para carregar dados e calcular pesos
botao_carregar = tk.Button(frame, text="Carregar Dados", command=carregar_dados)
botao_carregar.grid(row=1, column=0, padx=5, pady=5)

botao_calcular_pesos = tk.Button(frame, text="Calcular Pesos", command=calcular_pesos_variaveis)
botao_calcular_pesos.grid(row=1, column=1, padx=5, pady=5)

botao_calcular_similaridade = tk.Button(frame, text="Calcular Similaridade", command=calcular_pesos_similaridade)
botao_calcular_similaridade.grid(row=1, column=2, padx=5, pady=5)

botao_resposta = tk.Button(frame, text="Resposta", command=abrir_tela_resposta)
botao_resposta.grid(row=1, column=3, padx=5, pady=5)

# Área de texto para mostrar resultados
text_area = tk.Text(root, width=80, height=20)
text_area.pack(expand=True, fill='both')

botao_voltar = tk.Button(root, text="Voltar", command=voltar)

root.mainloop()
