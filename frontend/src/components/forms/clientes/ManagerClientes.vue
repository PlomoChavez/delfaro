<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tipo?: string;
    registro?: any;
    form?: string;
    classForm?: string;
    exportCliente?: boolean;
  }>(),
  {
    registro: null,
    tipo: "auto",
    form: "cliente",
    classForm: "w-100",
    exportCliente: true,
  }
);

// prettier-ignore
const emit = defineEmits([
  "export",
  "cancelar"
]);

const pnl: any = ref("");
// prettier-ignore
const localData: any = ref();
const schemaUse: any = ref([]);

// prettier-ignore
const schemaForm : any = [
  {
    label: "Nombre",
    type: "text",
    model: "nombre",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Segundo nombre",
    type: "text",
    model: "segundoNombre",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Apellido paterno",
    type: "text",
    model: "apellidoPaterno",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Apellido materno",
    type: "text",
    model: "apellidoMaterno",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "CURP",
    type: "text",
    model: "curp",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Fecha de nacimiento",
    type: "date",
    model: "fechaNacimiento",
    classElement: " col-sm-12 col-md-6  col-lg-4 ",
  },
  {
    label: "Sexo",
    type: "select",
    model: "sexo",
    classElement: " col-sm-12 col-md-6  col-lg-4 ",
      options: [
      {label:"Hombre",id:"Hombre"},
      {label:"Mujer",id:"Mujer"}
    ]
  },
  {
    label: "Telefono",
    type: "text",
    model: "telefono",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Correo electronico",
    type: "text",
    model: "correo",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Datos del auto",
    type: "separador",
    classElement: " col-12 ",
  },
  {
    label: "Marca",
    type: "text",
    model: "marca",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Modelo",
    type: "text",
    model: "modelo",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Año",
    type: "text",
    model: "anio",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Codigo Postal",
    type: "text",
    model: "codigoPostal",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Paquete de cobertura",
    type: "select",
    model: "paqueteCobertura",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
      options: [
      {label:"Basica",id:"Basica"},
      {label:"Limitada",id:"Limitada"},
      {label:"Amplia",id:"Amplia"},
    ]
  },
  { 
    label: "Obtener los detalles de accesorios",
    type: "switch",
    classElement: " col-12 col-md-6 col-lg-3 ",
    model: "obtenerDetallesAccesorios",
    options: [ 
      {label:"Si",id:"Si"}, 
      {label:"No",id:"No"} 
    ]
  },

];
// prettier-ignore
const schemaClienteCotizacion : any = [
  {
    label: "Nombre",
    type: "text",
    model: "nombre",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Segundo nombre",
    type: "text",
    model: "segundoNombre",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Apellido paterno",
    type: "text",
    model: "apellidoPaterno",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Apellido materno",
    type: "text",
    model: "apellidoMaterno",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Datos del auto",
    type: "separador",
    classElement: " col-12 ",
  },
  {
    label: "Marca",
    type: "text",
    model: "marca",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Modelo",
    type: "text",
    model: "modelo",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Año",
    type: "text",
    model: "anio",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Codigo Postal",
    type: "text",
    model: "codigoPostal",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Paquete de cobertura",
    type: "select",
    model: "paqueteCobertura",
    classElement: " col-sm-12 col-md-6  col-lg-4 ",
      options: [
      {label:"Basica",id:"Basica"},
      {label:"Limitada",id:"Limitada"},
      {label:"Amplia",id:"Amplia"},
    ]
  },
  {
    label: "Tipo de frecuencia de pago",
    type: "select",
    model: "frecuenciaPago",
    classElement: " col-sm-12 col-md-6  col-lg-4 ",
      options: [
      {label:"Contado",id:"Contado"},
      {label:"Mensual",id:"Mensual"},
      {label:"Trimestral",id:"Trimestral"},
      {label:"Semestral",id:"Semestral"},
    ]
  },
  { 
    label: "Obtener los detalles de accesorios",
    type: "switch",
    classElement: " col-sm-12 col-md-6  col-lg-4 ",
    model: "obtenerDetallesAccesorios",
    options: [ 
      {label:"Si",id:"Si"}, 
      {label:"No",id:"No"} 
    ]
  },
];
// prettier-ignore
const schemaUpdateCliente : any = [
  {
    label: "Nombre",
    type: "text",
    model: "nombre",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Segundo nombre",
    type: "text",
    model: "segundoNombre",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Apellido paterno",
    type: "text",
    model: "apellidoPaterno",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Apellido materno",
    type: "text",
    model: "apellidoMaterno",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
];

const dataTmp = {
  fechaNacimiento: "10-08-1994",
  nombre: "Jesus",
  segundoNombre: "Ramon",
  apellidoPaterno: "Chavez",
  apellidoMaterno: "Quiroz",
  curp: "CAQJ",
  sexo: {
    label: "Mujer",
    id: "Mujer",
  },
  paqueteCobertura: {
    label: "Basica",
    id: "Basica",
  },
  frecuenciaPago: {
    label: "Contado",
    id: "Contado",
  },
  telefono: "7442077733",
  correo: "de@de.com",
  marca: "Honda",
  modelo: "CR-V",
  anio: "2024",
  codigoPostal: "39600",
};

onMounted(async () => {
  if (props.tipo) {
    if (props.tipo == "nuevo") {
      pnl.value = "nuevo";
    } else if (props.tipo == "buscar") {
      pnl.value = "buscar";
    } else {
      pnl.value = "";
    }

    localData.value = props.registro == null ? dataTmp : props.registro;
  }
  if (props.form) {
    if (props.form == "clienteCotizacion") {
      schemaUse.value = schemaClienteCotizacion;
    } else if (props.form == "updateCliente") {
      schemaUse.value = schemaUpdateCliente;
    } else if (props.form == "buscar") {
      // schemaUse.value = schemaClienteCotizacion;
    }
  } else {
    schemaUse.value = schemaForm;
  }
});

const handleInicialSubmit = async () => {
  if (props.exportCliente) {
    emit("export", localData.value);
    pnl.value = "";
  }
};

const handleCancelarForm = async () => {
  if (props.tipo == "nuevo") {
    emit("cancelar");
  } else {
    pnl.value = "";
  }
};
</script>

<template>
  <div>
    <div v-if="pnl == ''" class="manager-clientes-container">
      <h4 class="titulo-opciones">Selecciona una opción:</h4>
      <div class="opciones-botones">
        <button class="btn" @click="pnl = 'nuevo'">
          <span class="fa fa-user-plus fa-2x"></span>
          <span class="btnText">Nuevo cliente</span>
        </button>
        <button class="btn" @click="pnl = 'buscar'" disabled>
          <span class="fa fa-search fa-2x"></span>
          <span class="btnText">Buscar cliente</span>
        </button>
      </div>
    </div>
    <div v-else-if="pnl == 'nuevo'" class="manager-clientes-container">
      <FormFactory
        :class="props.classForm || 'w-100'"
        :schema="schemaUse"
        :formLive="true"
        :modelValue="localData || {}"
        @update:modelValue="(val) => (localData = val)"
        :textButtonSubmit="'Guardar cliente'"
        :showIconButtonSubmit="false"
        :showIconButtonCancel="false"
        @submit="handleInicialSubmit"
        @cancel="handleCancelarForm"
      />
    </div>
    <div v-else-if="pnl == 'buscar'" class="manager-clientes-container">
      <h4 class="titulo-opciones">Selecciona una opción:</h4>
      <div class="opciones-botones">
        <button class="btn" @click="handleCancelarForm">
          <span class="fa fa-search fa-2x"></span>
          <span class="btnText">Buscar cliente</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.manager-clientes-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
}

.titulo-opciones {
  margin-bottom: 32px;
  font-size: 1.3rem;
  color: #535353;
  font-weight: 600;
  text-align: center;
}

.opciones-botones {
  display: flex;
  gap: 40px;
  justify-content: center;
  align-items: center;
}

.btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 150px;
  height: 120px;
  background: #fff;
  color: #535353;
  border: 2px solid #535353;
  border-radius: 14px;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: 0 2px 8px #535353;
  transition: box-shadow 0.2s, border-color 0.2s, background 0.2s;
}

.btn:hover {
  background: #f2f2f2;
  border-color: #535353;
  box-shadow: 0 4px 16px #535353;
  color: #535353;
}

.btn:disabled {
  background: #e7e7e7;
  color: #898989;
  border-color: #898989;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.7;
  pointer-events: none;
}
.fa-2x {
  font-size: 36px;
}

.btnText {
  margin-top: 8px;
  font-weight: 500;
  font-size: 1.05rem;
  text-align: center;
}
</style>
