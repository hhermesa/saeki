 'use client';

  import { useState, useEffect, useCallback } from 'react';
  import useUpload from '@/hooks/useUpload';
  import useMaterials from '@/hooks/useMaterials';
  import ChatWidget from '@/components/ChatWidget';
  import { Stepper } from '@/components/Stepper';
  import { UploadStep } from '@/components/wizardSteps/UploadStep';
  import { ConfigureStep } from '@/components/wizardSteps/ConfigureStep';
  import CheckoutStep from '@/components/wizardSteps/CheckoutStep';
  import { CustomerInfo, CardInfo, PaymentMethod } from '@/types/types';
 import {apiFetch} from "@/lib/api";

  export default function UploadPage() {
    const { files, setFiles, uploads, setUploads, error: uploadError, loading, uploadFiles } = useUpload();
    const [materials] = useMaterials();

    const FILE_INPUT_ID = 'step-iges-uploader';
    const [step, setStep] = useState(0);
    const titles = ['Upload Your Parts', 'Configure Your Parts', 'Checkout & Payment'];

    const [materialIds, setMaterialIds] = useState<(number | null)[]>([]);
    useEffect(() => {
      setMaterialIds(Array(uploads.length).fill(null));
    }, [uploads]);

    const [customer, setCustomer] = useState<CustomerInfo>({ name: '', email: '', company: '' });
    const [poFile, setPoFile] = useState<File | null>(null);
    const [poUrl, setPoUrl] = useState<string | null>(null);
    const [poError, setPoError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('purchase_order');
    const [card, setCard] = useState<CardInfo>({ number: '', holder: '', cvv: '' });

    const [orderSuccess, setOrderSuccess] = useState<number | null>(null);
    const [fileSelectError, setFileSelectError] = useState<string | null>(null);

    const [showConfirm, setShowConfirm] = useState(false);
    useEffect(() => {
      document.body.style.overflow = showConfirm ? 'hidden' : 'auto';
      return () => { document.body.style.overflow = 'auto'; };
    }, [showConfirm]);

    const handleUploadClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (!files.length) {
        setFileSelectError('Please select at least one file before uploading.');
        return;
      }
      setFileSelectError(null);
      try {
        const uploaded = await uploadFiles();
        if (uploaded.length) setStep(1);
        else setFileSelectError('Upload failed: no files were received.');
      } catch {
        setFileSelectError('Upload failed. Please try again.');
      }
    }, [files, uploadFiles]);

    const handleNextToCheckout = () => {
      if (materialIds.some((m) => m === null)) return;
      setStep(2);
    };

    const handlePoUpload = async () => {
      if (!poFile) return;
      const form = new FormData();
      form.append('file', poFile);
      try {
        const res = await apiFetch<{ fileUrl: string }[]>('/upload', { method: 'POST', body: form });
        const [{ fileUrl }] = res;
        setPoUrl(fileUrl);
        setPoError(null);
      } catch (err: unknown) {
        const message =
            err instanceof Error
                ? err.message
                : typeof err === 'string'
                    ? err
                    : JSON.stringify(err);
        setPoError(message);
      }
    };

    const handleReset = () => {
      setUploads([]);
      setFiles([]);
      setMaterialIds([]);
      const inp = document.getElementById(FILE_INPUT_ID) as HTMLInputElement | null;
      if (inp) inp.value = '';
      setCustomer({ name: '', email: '', company: '' });
      setPoFile(null);
      setPoUrl(null);
      setPoError(null);
      setPaymentMethod('purchase_order');
      setCard({ number: '', holder: '', cvv: '' });
      setShowConfirm(false);
      setStep(0);
      setOrderSuccess(null);
    };

    const handleClearPo = useCallback(() => {
      setPoUrl(null);
      setPoFile(null);
      setPoError(null);
      const inp = document.getElementById('po-uploader') as HTMLInputElement | null;
      if (inp) inp.value = '';
    }, []);

    return (
        <div className="min-h-screen bg-pastel-lavender flex flex-col items-center pb-8">
          <Stepper
              steps={['Upload', 'Configure', 'Checkout']}
              current={step}
              finished={orderSuccess !== null}
              colors={{
                completed: 'bg-warm-teal',
                active: 'bg-coral',
                upcoming: 'bg-gray-300',
              }}
          />

          <div className="w-full flex flex-col max-w-xl px-6 grow justify-center items-center pt-6">
            {orderSuccess !== null ? (
                <div className="flex flex-col items-center justify-center p-6">
                  <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
                  <p className="text-lg mb-6">
                    🎉 Your order <strong>#{orderSuccess}</strong> has been placed.
                  </p>
                  <button
                      onClick={handleReset}
                      className="px-6 py-3 bg-charcoal text-white rounded hover:bg-eerie-black"
                  >
                    Start a New Order
                  </button>
                  <ChatWidget orderId={orderSuccess} authorEmail={customer.email} />
                </div>
            ) : (
                <>
                  <h1 className="text-3xl font-bold mb-6 text-center w-full text-stone-700">
                    {titles[step]}
                  </h1>

                  {step === 0 && (
                      <UploadStep
                          files={files}
                          loading={loading}
                          uploadError={uploadError}
                          fileSelectError={fileSelectError}
                          onFilesChange={setFiles}
                          onUploadClick={handleUploadClick}
                          inputId={FILE_INPUT_ID}
                      />
                  )}

                  {step === 1 && (
                      <ConfigureStep
                          uploads={uploads}
                          materials={materials}
                          selectedIds={materialIds}
                          onSelect={(i, id) =>
                              setMaterialIds((ids) => {
                                const newIds = [...ids];
                                newIds[i] = id;
                                return newIds;
                              })
                          }
                          onNext={handleNextToCheckout}
                      />
                  )}

                  {step === 2 && (
                      <CheckoutStep
                          uploads={uploads}
                          materials={materials}
                          materialIds={materialIds}
                          customer={customer}
                          onCustomerChange={setCustomer}
                          poFile={poFile}
                          poUrl={poUrl}
                          onPoFileChange={setPoFile}
                          onUploadPo={handlePoUpload}
                          poError={poError}
                          onClearPo={handleClearPo}
                          paymentMethod={paymentMethod}
                          onPaymentMethodChange={(m) => {
                            setPaymentMethod(m);
                            if (m === 'card') {
                              setPoFile(null);
                              setPoUrl(null);
                            }
                          }}
                          card={card}
                          onCardChange={(field, value) =>
                              setCard((c) => ({ ...c, [field]: value }))
                          }
                          onOrderSuccess={setOrderSuccess}
                      />
                  )}
                </>
            )}
          </div>
        </div>
    );
  }