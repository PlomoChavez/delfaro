SELECT 
        `companias_productos`.`id` AS `id`,
        `companias_productos`.`compania_id` AS `compania_id`,
        `companias_productos`.`ramo_id` AS `ramo_id`,
        `companias_productos`.`nombre` AS `nombre`,
        `companias_productos`.`created_at` AS `created_at`,
        `companias_productos`.`updated_at` AS `updated_at`,
        `companias_productos`.`estatus` AS `estatus`,
        `ramos`.`id` AS `ramo_id`,
        `ramos`.`label` AS `ramo_label`,
        `ramos`.`estatus` AS `ramo_estatus`,
        `ramos`.`created_at` AS `ramo_created_at`,
        `ramos`.`updated_at` AS `ramo_updated_at`,
        `ramos`.`deleted_at` AS `ramo_deleted_at`,
        `compania`.`id` AS `compania_id`,
        `compania`.`rfc` AS `compania_rfc`,
        `compania`.`nombre` AS `compania_nombre`,
        `compania`.`nombreCorto` AS `compania_nombreCorto`,
        `compania`.`direccion` AS `compania_direccion`,
        `compania`.`estado` AS `compania_estado`,
        `compania`.`codigoPostal` AS `compania_codigoPostal`,
        `compania`.`ciudad` AS `compania_ciudad`,
        `compania`.`limitePrimerPago` AS `compania_limitePrimerPago`,
        `compania`.`limitePrimerSubsecuente` AS `compania_limitePrimerSubsecuente`,
        `compania`.`estatus` AS `compania_estatus`,
        `compania`.`colonia` AS `compania_colonia`,
        `compania`.`created_at` AS `compania_created_at`,
        `compania`.`updated_at` AS `compania_updated_at` 
    FROM `companias_productos`  
LEFT JOIN `ramos` ON `companias_productos`.`ramo_id` = `ramos`.`id` 
LEFT JOIN `compania` ON `companias_productos`.`compania_id` = `compania`.`id` 
WHERE `companias_productos`.`ramo_id` = 1
