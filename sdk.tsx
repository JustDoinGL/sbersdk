const mockCreateDraft = async (): Promise<void> => {};

const mockHandleLoadDocuments = async (
  type: DocumentLoadedTypes,
): Promise<
  {
    fileId: string;
    name: string;
    unifiedId?: string;
    documentType?: string;
  }[]
> => [];

const mockHandleCreatePaymentCalculation = async (
  data: ProductCalculationRequest,
): Promise<{
  paymentUrl: string;
  paymentShortUrl: string;
}> => ({
  paymentUrl: '',
  paymentShortUrl: '',
});

const mockHandleDownloadDocument = async (
  fileId: string,
  name: string,
): Promise<void> => {};

const mockHandleSendDocumentsFile = async (
  args: SendDocumentArgs,
): Promise<void> => {};

const mockMapToEpkClients = (): CreateEpkClientDto[] => [];

const mockHandlePaymentCompleted = (
  calculationDto: CalculationDto,
): void => {};

return (
  <ProductContextProvider
    handleCreateDraft={mockCreateDraft}
    handleLoadDocuments={mockHandleLoadDocuments}
    handleCreatePaymentCalculation={mockHandleCreatePaymentCalculation}
    handleDownloadDocument={mockHandleDownloadDocument}
    handleSendDocumentsFile={mockHandleSendDocumentsFile}
    mapToEpkClients={mockMapToEpkClients}
    handlePaymentCompleted={mockHandlePaymentCompleted}
  >
    {children}
  </ProductContextProvider>
);