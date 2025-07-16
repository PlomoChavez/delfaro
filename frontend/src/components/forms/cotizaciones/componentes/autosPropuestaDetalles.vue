<template>
  <div>
    <div v-if="cotizacion.compania == 'QUALITAS'">
      <table class="table table-bordered w-100 mt-4">
        <thead>
          <tr>
            <th>Cobertura</th>
            <th class="text-center">Suma asegurada</th>
            <th class="text-center">Deducible</th>
            <th class="text-center">Prima</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in cotizacion.detalles.coberturasBasicas"
            :key="idx"
          >
            <td>{{ row.cobertura }}</td>
            <td class="text-center">
              <template v-if="Array.isArray(row.sumaSegura)">
                <template v-for="(item, i) in row.sumaSegura" :key="i">
                  <template v-if="item.tag === 'p'">
                    <span>{{ item.texto }}</span>
                  </template>
                  <template v-else>
                    <span>
                      {{
                        item.valor.texto ||
                        item.texto ||
                        (item.checked ? "Sí" : "No")
                      }}
                    </span>
                  </template>
                  <br />
                </template>
              </template>
              <template v-else>
                <span>
                  {{
                    row.sumaSegura?.valor?.texto ||
                    row.sumaSegura?.texto ||
                    row.sumaSegura?.valor ||
                    ""
                  }}
                </span>
              </template>
            </td>
            <td class="text-center">
              <span>
                <!-- Si deducible es select o p, solo muestra el texto/valor -->
                {{ row.deducible?.valor?.texto || "" }}
              </span>
            </td>
            <td class="text-center">
              <span>
                {{ row.prima?.texto || "" }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{
  cotizacion: any;
}>();
</script>

<style scoped>
tbody tr:not(:last-child) td {
  border-bottom: 1px solid #000;
  padding-bottom: 5px;
}
</style>
