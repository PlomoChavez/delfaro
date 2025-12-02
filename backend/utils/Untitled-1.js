/**
 * Eliminar un registro específico de la tabla clientes.
 */
exports.enviarArchivosPoliza = async (req, res) => {
  const mailOptions = {
    to: "jesus.r.chavez.q.94@gmail.com", // Correo del cliente asociado a la póliza
    subject: `Envío de Póliza: `,
    text: `Estimado/a ,\n\nAdjunto encontrará la información de su póliza.`,
    html: `<p>Estimado/a ,</p>
             <p>Adjunto encontrará la información de su póliza.</p>`,
  };

  // Enviar el correo
  await enviarCorreo(mailOptions);
  // const id = req.body.poliza_id;
  // let query = {
  //   modelo,
  //   filtros: { id },
  // };

  // let rows = await queryWithRelations(query);

  // if (rows.length != 1) {
  //   return res.json({
  //     result: false,
  //     message: "Póliza no encontrada",
  //   });
  // }

  res.json(result);
};
