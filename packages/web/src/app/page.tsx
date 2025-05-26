  'use client';

  import { useState, useEffect, useCallback } from 'react';
  import useUpload from '@/hooks/useUpload';
  import useMaterials from '@/hooks/useMaterials';
  import FileUploadSection from '@/components/FileUploadSection';
  import PreviewSection from '@/components/PreviewSection';
  import CustomerInfoSection from '@/components/CustomerInfoSection';
  import PaymentSection from '@/components/PaymentSection';
  import ChatWidget from '@/components/ChatWidget';
  import { apiFetch } from '@/lib/api';
  import { Stepper } from '@/components/Stepper';
  import {validateOrder} from "@/lib/validation";

  export default function UploadPage() {
    const { files, setFiles, uploads, setUploads, error: uploadError, loading, uploadFiles } = useUpload();
    const [materials] = useMaterials();

    const FILE_INPUT_ID = 'step-iges-uploader';
    const [step, setStep] = useState(0);

    const titles = [
      'Upload Your Parts',
      'Configure Your Parts',
      'Checkout & Payment'
    ];

    const [materialIds, setMaterialIds] = useState<(number | null)[]>([]);
    useEffect(() => {
      setMaterialIds(Array(uploads.length).fill(null));
    }, [uploads]);

    const [customer, setCustomer] = useState({ name: '', email: '', company: '' });
    const [poFile, setPoFile] = useState<File | null>(null);
    const [poUrl, setPoUrl] = useState<string | null>(null);
    const [poError, setPoError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'purchase_order' | 'card'>('purchase_order');
    const [card, setCard] = useState({ number: '', holder: '', cvv: '' });
    const [orderSuccess, setOrderSuccess] = useState<number | null>(null);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [fileSelectError, setFileSelectError] = useState<string | null>(null);

    const formValidation = validateOrder(customer, paymentMethod, card, poUrl);

    useEffect(() => {
      document.body.style.overflow = showConfirm ? 'hidden' : 'auto';
      return () => { document.body.style.overflow = 'auto'; };
    }, [showConfirm]);

    const handleUploadClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (files.length === 0) {
        setFileSelectError('Please select at least one file before uploading.');
        return;
      }
      setFileSelectError(null);

      try {
        const uploaded = await uploadFiles();

        if (uploaded.length > 0) {
          setStep(1);
        } else {
          setFileSelectError('Upload failed: no files were received.');
        }
      } catch (err) {
        setFileSelectError('Upload failed. Please try again.');
      }
    }, [files, uploadFiles]);

    const handleNextToCheckout = () => {
      if (materialIds.some((m) => m === null)) return;
      setStep(2);
    };

    const handlePlaceAttempt = () => {
      setOrderError(null);
      if (!formValidation.isValid && formValidation.error) {
        return setOrderError(formValidation.error);
      }
      setShowConfirm(true);
    };

    const handleConfirm = async () => {
      setShowConfirm(false);
      let cardToken: string | null = null;
      if (paymentMethod === 'card') cardToken = Date.now().toString();
      const payload = {
        customer,
        items: uploads.map((u, i) => ({ fileUrl: u.fileUrl, materialId: materialIds[i]!, quantity: 1 })),
        paymentMethod,
        purchaseOrderUrl: paymentMethod === 'purchase_order' ? poUrl : null,
        cardToken,
      };
      try {
        const { orderId } = await apiFetch<{ orderId: number }>('/orders', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        setOrderSuccess(orderId);
      } catch (err: any) {
        setOrderError(err.message || 'Failed to place order');
      }
    };

    const handlePoUpload = async () => {
      if (!poFile) return;
      const form = new FormData(); form.append('file', poFile);
      try {
        const res = await fetch('http://localhost:4000/upload', { method: 'POST', body: form });
        if (!res.ok) throw new Error(await res.text());
        const [{ fileUrl }] = await res.json();
        setPoUrl(fileUrl); setPoError(null);
      } catch (e: any) { setPoError(e.message); }
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
      setOrderError(null);
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

    if (orderSuccess !== null) {
      return (
          <div className="min-h-screen bg-[#FFF8F2] flex flex-col items-center justify-center p-6">
            <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
            <p className="text-lg mb-6">🎉 Your order <strong>#{orderSuccess}</strong> has been placed.</p>
            <button
                onClick={handleReset}
                className="px-6 py-3 bg-charcoal text-white rounded hover:bg-eerie-black"
            >
              Start a New Order
            </button>
            {orderSuccess === null ? null : <ChatWidget orderId={orderSuccess} authorEmail={customer.email} />}

          </div>
      );
    }

    return (
        <div className="min-h-screen bg-[#FFF8F2] flex flex-col items-center pb-8">
          <Stepper
              steps={['Upload','Configure','Checkout']}
              current={step}
              finished={orderSuccess !== null}
              colors={{ completed: 'bg-warm-teal', active: 'bg-coral', upcoming: 'bg-gray-300' }}
          />
          <div className="w-full flex flex-col max-w-xl px-6 grow justify-center items-center pt-6">
            <h1 className="text-3xl font-bold mb-6 text-center w-full text-stone-700">{titles[step]}</h1>

            {step === 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6 w-full">
                  <form className="space-y-4">
                    <FileUploadSection
                        className="h-64"
                        accept=".step,.iges"
                        multiple={true}
                        inputId={FILE_INPUT_ID}
                        files={files}
                        onChange={setFiles}
                        title="Drag &amp; drop your STEP/IGES files here"
                        subtitle="or click to select"
                    />
                    <button
                        type="button"
                        onClick={handleUploadClick}
                        disabled={loading}
                        className="px-4 py-2 bg-charcoal text-white rounded hover:bg-eerie-black disabled:opacity-50"
                    >
                      {loading ? 'Uploading…' : 'Upload Files'}
                    </button>
                  </form>
                  {fileSelectError && (
                      <p className="mt-2 text-red-500">
                        <strong>Error:</strong> {fileSelectError}
                      </p>
                  )}
                  {uploadError && <p className="mt-4 text-red-500"><strong>Error:</strong> {uploadError}</p>}
                </div>
            )}

            {step === 1 && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6 space-y-6">
                  <PreviewSection
                      uploads={uploads}
                      materials={materials}
                      selectedIds={materialIds}
                      onSelect={(i, id) => setMaterialIds((ids) => { const c=[...ids]; c[i]=id; return c; })}
                  />
                  <button
                      type="button"
                      onClick={handleNextToCheckout}
                      disabled={materialIds.some((m) => m===null)}
                      className="w-full px-4 py-2 bg-charcoal text-white rounded hover:bg-eerie-black  disabled:opacity-50"
                  >
                    To Checkout
                  </button>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6 space-y-6 w-full">
                  <CustomerInfoSection customer={customer} onChange={setCustomer} />
                  <PaymentSection
                      method={paymentMethod}
                      onMethodChange={(m) => { setPaymentMethod(m); if (m==='card') { setPoFile(null); setPoUrl(null); } }}
                      poFile={poFile}
                      onPoFileChange={setPoFile}
                      poUrl={poUrl}
                      onUploadPo={handlePoUpload}
                      poError={poError}
                      onClearPoUrl={handleClearPo}
                      card={card}
                      onCardChange={(f,v)=>setCard(c=>({...c,[f]:v}))}
                  />
                  <button
                      onClick={handlePlaceAttempt}
                      className="w-full px-4 py-2 bg-charcoal text-white rounded hover:bg-eerie-black"
                  >
                    Place Order
                  </button>
                  {orderError && (
                      <p className="mt-2 text-red-500 text-center">
                        {orderError}
                      </p>
                  )}
                  {showConfirm && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6">
                          <h2 className="text-xl font-bold mb-4">Confirm Your Order</h2>
                          <div className="space-y-2 text-sm">
                            <p><strong>Name:</strong> {customer.name}</p>
                            <p><strong>Email:</strong> {customer.email}</p>
                            {customer.company && <p><strong>Company:</strong> {customer.company}</p>}
                            <p><strong>Payment:</strong> {paymentMethod==='card'?'Credit Card':'Purchase Order'}</p>
                            {paymentMethod==='purchase_order' && poFile && <p><strong>PO File:</strong> {poFile.name}</p>}
                            {paymentMethod==='card' && <p><strong>Card:</strong> •••• {card.number.slice(-4)}</p>}
                          </div>
                          <div className="mt-4 space-y-2">
                            <h3 className="font-semibold">Parts & Materials:</h3>
                            <ul className="list-disc list-inside text-sm">
                              {uploads.map((u,i)=>(
                                  <li key={i}>{u.originalName} → <em>{materials.find(m=>m.id===materialIds[i])?.name||'—'}</em></li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-6 flex justify-end gap-2">
                            <button onClick={()=>setShowConfirm(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                            <button onClick={handleConfirm} className="px-4 py-2 bg-charcoal text-white rounded hover:bg-eerie-black">Confirm & Place</button>
                          </div>
                        </div>
                      </div>
                  )}
                </div>
            )}

          </div>
        </div>
    );
  }

