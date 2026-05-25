
CREATE TABLE Pessoas (
    ID_Pessoa AUTOINCREMENT PRIMARY KEY,
    Nome VARCHAR(255),
    CPF VARCHAR(20) UNIQUE,
    RG VARCHAR(20),
    Data_Nascimento DATETIME,
    Genero VARCHAR(50),
    Telefone VARCHAR(30),
    Email VARCHAR(255),
    Endereco VARCHAR(255),
    Cidade VARCHAR(100),
    Estado VARCHAR(50),
    CEP VARCHAR(20),
    Situacao_Vulnerabilidade LONGTEXT,
    Data_Cadastro DATETIME,
    ID_Prioridade INTEGER
);

CREATE TABLE Documentos_Pessoa (
    ID_Documento AUTOINCREMENT PRIMARY KEY,
    ID_Pessoa INTEGER,
    Tipo_Documento VARCHAR(100),
    Numero_Documento VARCHAR(100),
    Validade DATETIME
);

CREATE TABLE Instituicoes (
    ID_Instituicao AUTOINCREMENT PRIMARY KEY,
    Nome VARCHAR(255),
    Tipo VARCHAR(100),
    Telefone VARCHAR(30),
    Email VARCHAR(255),
    Endereco VARCHAR(255)
);

CREATE TABLE Servicos (
    ID_Servico AUTOINCREMENT PRIMARY KEY,
    ID_Instituicao INTEGER,
    Nome_Servico VARCHAR(255),
    Descricao LONGTEXT,
    Categoria VARCHAR(100),
    Ativo YESNO
);

CREATE TABLE Agendamentos (
    ID_Agendamento AUTOINCREMENT PRIMARY KEY,
    ID_Pessoa INTEGER,
    ID_Servico INTEGER,
    Data_Agendamento DATETIME,
    Status VARCHAR(50),
    Observacoes LONGTEXT,
    Criado_Em DATETIME
);

CREATE TABLE Atendimentos (
    ID_Atendimento AUTOINCREMENT PRIMARY KEY,
    ID_Agendamento INTEGER,
    Descricao LONGTEXT,
    Encaminhamento LONGTEXT,
    Data_Atendimento DATETIME,
    ID_Usuario INTEGER
);

CREATE TABLE Usuarios (
    ID_Usuario AUTOINCREMENT PRIMARY KEY,
    Nome VARCHAR(255),
    Email VARCHAR(255),
    Senha VARCHAR(255),
    Cargo VARCHAR(100),
    Nivel_Acesso VARCHAR(100),
    Ativo YESNO
);

CREATE TABLE Permissoes (
    ID_Permissao AUTOINCREMENT PRIMARY KEY,
    Nome_Permissao VARCHAR(255)
);

CREATE TABLE Usuario_Permissao (
    ID_Usuario INTEGER,
    ID_Permissao INTEGER
);

CREATE TABLE Acessos_Servico (
    ID_Acesso AUTOINCREMENT PRIMARY KEY,
    ID_Pessoa INTEGER,
    ID_Servico INTEGER,
    Data_Acesso DATETIME,
    Tipo_Acesso VARCHAR(100)
);

CREATE TABLE Prioridades (
    ID_Prioridade AUTOINCREMENT PRIMARY KEY,
    Nome VARCHAR(100),
    Nivel INTEGER
);

CREATE TABLE Avaliacoes_Sociais (
    ID_Avaliacao AUTOINCREMENT PRIMARY KEY,
    ID_Pessoa INTEGER,
    Renda_Familiar CURRENCY,
    Qtd_Dependentes INTEGER,
    Possui_Moradia YESNO,
    Score_Vulnerabilidade INTEGER
);
