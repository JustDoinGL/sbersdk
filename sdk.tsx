const AccidentContent = () => {
  // ...

  const createDraft = async () => {
    await form.handleSubmit(
      async (data: OutputOsagoSchema) => {
        const result = await createDraftAction(data);

        await applyCalculationResult({
          ...result,
          successTitle: 'Черновик успешно создан',
        });
      },
      (errors) => {
        console.error({ errors });

        const msg =
          'На одном из экранов есть неправильно заполненные поля';

        form.setError('root', {
          message: msg,
        });
      },
    )();
  };

  const Component = accidentSteps[currentStep].screen;

  return (
    <ProductContextProvider
      handleCreateDraft={createDraft}
      handleAppointmentCalculation={() => {}}
      handleDownloadDocument={() => {}}
    >
      <Component />
    </ProductContextProvider>
  );
};