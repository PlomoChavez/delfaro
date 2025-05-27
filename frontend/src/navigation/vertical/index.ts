export default [
  {
    title: "Home",
    to: { name: "root" },
    icon: { icon: "tabler-smart-home" },
  },
  // {
  //   title: "Denegado",
  //   to: { name: "denegado" },
  //   icon: { icon: "tabler-smart-home" },
  // },
  {
    title: "Administrador",
    icon: { icon: "tabler-settings" },

    children: [
      // 2nd level
      {
        title: "Catalogos",
        children: [
          // 3rd level
          { title: "Actividades", to: { name: "catalogos-actividades" } },
          { title: "Compañias", to: { name: "catalogos-companias" } },
          {
            title: "Estatus de clientes",
            to: { name: "catalogos-estatus-clientes" },
          },
          { title: "Método de pago", to: { name: "catalogos-metodo-pago" } },
          { title: "Ramos", to: { name: "catalogos-lineas" } },
          {
            title: "Tipos de vencimiento",
            to: { name: "catalogos-tipos-vencimiento" },
          },
          {
            title: "Tipos de usuarios",
            to: { name: "catalogos-tipos-usuarios" },
          },
        ],
      },
      {
        title: "Asegurados",
        to: { name: "asegurados" },
      },
      // {
      //   title: "Promotores",
      //   to: { name: "promotores" },
      // },
      {
        title: "Usuarios",
        to: { name: "usuarios" },
      },
    ],
  },
  {
    title: "Polizas",
    to: { name: "polizas" },
    icon: { icon: "tabler-books" },
  },
  {
    title: "Clientes",
    to: { name: "clientes" },
    icon: { icon: "tabler-users" },
  },
  // {
  //   title: "Agenda",
  //   to: { name: "agenda" },
  //   icon: { icon: "tabler-calendar" },
  // },
  {
    title: "Cotizaciones",
    to: { name: "cotizaciones" },
    icon: { icon: "tabler-calendar" },
  },
];
