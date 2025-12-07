-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 06-05-2025 a las 03:26:47
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `inventario`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `brands`
--

CREATE TABLE `brands` (
  `id` int(11) NOT NULL,
  `code` varchar(5) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `user_creates_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `user_updates_id` int(11) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `brands`
--

INSERT INTO `brands` (`id`, `code`, `name`, `description`, `is_active`, `user_creates_id`, `created_at`, `user_updates_id`, `updated_at`) VALUES
(1, 'MARC5', 'TESLA', 'marca de computadores', 0, 1, '2025-03-11 18:34:21', NULL, '2025-03-11 23:37:08'),
(2, 'MARC4', 'SAMSUNG', 'dfdfjifdidffhi', 1, 1, '2025-03-11 18:35:28', NULL, '2025-03-11 18:35:28'),
(4, 'MARCA', 'HOLA', 'dfdfjifdidffhi', 1, 1, '2025-03-19 23:26:46', NULL, '2025-03-19 23:26:46'),
(5, 'camis', 'sport', 'dfdfjifdidffhi', 1, 1, '2025-03-19 23:44:18', NULL, '2025-03-19 23:44:18'),
(8, 'danba', 'soba', 'gkgigl', 1, 1, '2025-04-25 18:22:52', NULL, '2025-04-25 18:22:52');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `categoria_id` int(7) NOT NULL,
  `categoria_nombre` varchar(20) NOT NULL,
  `categoria_ubicacion` varchar(150) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `user_creates-_id` int(11) NOT NULL,
  `created_ad` datetime NOT NULL,
  `user_update_id` int(11) DEFAULT NULL,
  `updated_up` datetime(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `code` varchar(5) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `user_creates_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `user_updates_id` int(11) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id`, `code`, `name`, `description`, `is_active`, `user_creates_id`, `created_at`, `user_updates_id`, `updated_at`) VALUES
(1, 'camis', 'sport_dom', 'dfdfjifdidffhi', 1, 1, '2025-03-20 05:32:44', NULL, '2025-03-20 05:32:44'),
(2, 'cola_', 'sporjjdjjt_dom', 'dfdfjifdidffhi', 1, 1, '2025-04-25 04:07:24', NULL, '2025-04-25 04:07:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `code` varchar(5) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `user_creates_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `user_updates_id` int(11) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `code` varchar(5) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `user_creates_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `user_updates_id` int(11) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `firstname` varchar(25) NOT NULL COMMENT 'primer nombre',
  `secondname` varchar(25) DEFAULT NULL COMMENT 'segundo nombre',
  `firstlastname` varchar(25) NOT NULL COMMENT 'primer apellido',
  `secondlastname` varchar(25) NOT NULL COMMENT 'segundo apellido',
  `photo` text DEFAULT NULL COMMENT 'fotografia del usuario en formato texto',
  `email` varchar(100) NOT NULL COMMENT 'direccion de correo electronico.',
  `password` varchar(100) NOT NULL COMMENT 'contraseña del usuario',
  `is_active` tinyint(1) NOT NULL,
  `user_creates_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `user_updates_id` int(11) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `firstname`, `secondname`, `firstlastname`, `secondlastname`, `photo`, `email`, `password`, `is_active`, `user_creates_id`, `created_at`, `user_updates_id`, `updated_at`) VALUES
(1, 'miriam', 'delfina', 'duran', 'castro', NULL, 'santiago74@hotmail.com', '$2b$10$9b53uityjs8GOH.NfiVCe.PfYidMACCmIsuYtVue9y95Mr0QriUUe', 0, 1, '2025-04-20 21:19:52', NULL, '2025-05-04 04:48:36');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `brands_code` (`code`),
  ADD UNIQUE KEY `brands_name` (`name`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`categoria_id`);

--
-- Indices de la tabla `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_code` (`code`),
  ADD UNIQUE KEY `products_name` (`name`);

--
-- Indices de la tabla `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reports_code` (`code`),
  ADD UNIQUE KEY `reports_name` (`name`);

--
-- Indices de la tabla `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `suppliers_code` (`code`),
  ADD UNIQUE KEY `suppliers_name` (`name`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `users_firstname` (`firstname`),
  ADD KEY `users_firstlastname` (`firstlastname`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `brands`
--
ALTER TABLE `brands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `categoria_id` int(7) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
