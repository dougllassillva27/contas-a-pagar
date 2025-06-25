-- Schema completo para o projeto Painel Financeiro
-- Versão: 1.0
-- Data: 2025-06-25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Estrutura da tabela `usuarios`
--
CREATE TABLE `usuarios` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `senha_hash` VARCHAR(255) NOT NULL,
  `data_criacao` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estrutura da tabela `rendas`
--
CREATE TABLE `rendas` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` INT(11) NOT NULL,
  `descricao` VARCHAR(255) NOT NULL,
  `valor` DECIMAL(10,2) NOT NULL,
  `tipo` ENUM('SALARIO','EXTRA') NOT NULL,
  `ordem` INT(11) NOT NULL DEFAULT 0,
  `mes_ano_referencia` VARCHAR(7) NOT NULL,
  `data_criacao` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `rendas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estrutura da tabela `contas`
--
CREATE TABLE `contas` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` INT(11) NOT NULL,
  `descricao` VARCHAR(255) NOT NULL,
  `valor` DECIMAL(10,2) NOT NULL,
  `mes_ano_referencia` VARCHAR(7) NOT NULL,
  `dia_vencimento` INT(11) DEFAULT NULL,
  `tipo` ENUM('FIXA','PARCELADA','UNICA','MORR','MAE','VO') NOT NULL,
  `parcela_info` VARCHAR(20) DEFAULT NULL,
  `status` ENUM('PENDENTE','PAGA') NOT NULL DEFAULT 'PENDENTE',
  `ordem` INT(11) NOT NULL DEFAULT 0,
  `nome_terceiro` VARCHAR(100) DEFAULT NULL,
  `data_criacao` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `contas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estrutura da tabela `anotacoes` (Inferida da API)
--
CREATE TABLE `anotacoes` (
  `usuario_id` INT(11) NOT NULL,
  `mes_ano_referencia` VARCHAR(7) NOT NULL,
  `conteudo` TEXT,
  PRIMARY KEY (`usuario_id`,`mes_ano_referencia`),
  CONSTRAINT `anotacoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estrutura da tabela `valores_conferencia` (Inferida da API)
--
CREATE TABLE `valores_conferencia` (
  `usuario_id` INT(11) NOT NULL,
  `mes_ano_referencia` VARCHAR(7) NOT NULL,
  `tipo_valor` VARCHAR(50) NOT NULL,
  `valor` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`usuario_id`,`mes_ano_referencia`,`tipo_valor`),
  CONSTRAINT `valores_conferencia_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


--
-- Exemplo de inserção do primeiro usuário.
-- Use o script `gerar_hash.php` para criar o seu hash de senha.
--
-- INSERT INTO `usuarios` (`nome`, `email`, `senha_hash`) VALUES
-- ('Seu Nome', 'seu_email@provedor.com', 'SEU_HASH_GERADO_AQUI');