CREATE TABLE `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `senha_hash` VARCHAR(255) NOT NULL,
  `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `rendas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `descricao` VARCHAR(255) NOT NULL,
  `valor` DECIMAL(10, 2) NOT NULL,
  `tipo` ENUM('SALARIO', 'EXTRA') NOT NULL,
  `mes_ano_referencia` VARCHAR(7) NOT NULL,
  `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `contas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `descricao` VARCHAR(255) NOT NULL,
  `valor` DECIMAL(10, 2) NOT NULL,
  `mes_ano_referencia` VARCHAR(7) NOT NULL,
  `dia_vencimento` INT NOT NULL,
  `tipo` ENUM('FIXA', 'PARCELADA', 'UNICA') NOT NULL,
  `parcela_info` VARCHAR(20) DEFAULT NULL,
  `status` ENUM('PENDENTE', 'PAGA') NOT NULL DEFAULT 'PENDENTE',
  `nome_terceiro` VARCHAR(100) DEFAULT NULL,
  `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Lembre-se de trocar 'seu_nome', 'seu_email@provedor.com' e 'sua_senha_segura'
INSERT INTO usuarios (nome, email, senha_hash) VALUES ('dougllassillva27', 'dougllassillva27@gmail.com', '$2y$10$lOzL0I9s9uxdDMil/OxTF.G1XqUYt.QvhmU0fma4e6KWH8/JCLSha');

-- ADD coluna ordem
ALTER TABLE `contas` ADD `ordem` INT NOT NULL DEFAULT 0 AFTER `status`;
ALTER TABLE `rendas` ADD `ordem` INT NOT NULL DEFAULT 0 AFTER `tipo`;