"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { useGiftBuilder } from "@/components/builder/useGiftBuilder";
import StepIndicator from "@/components/builder/StepIndicator";
import ShareStep from "@/components/builder/ShareStep";
import TemplateSelector from "@/components/builder/TemplateSelector";
import CustomizationPanel from "@/components/builder/CustomizationPanel";
import MessageEditor from "@/components/builder/MessageEditor";
import AudioUploader from "@/components/builder/AudioUploader";
import ImageUploader from "@/components/builder/ImageUploader";
import LivePreview from "@/components/builder/LivePreview";
import { SceneEditor } from "@/components/builder/scene-editor";
import { buildDefaultFlowerTreeScene } from "@/lib/flower-tree-scene";
import Button from "@/components/ui/Button";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 180 : -180,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -180 : 180,
    opacity: 0,
  }),
};

function EmptyTemplates() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full border border-[rgba(96,61,77,0.18)] bg-[rgba(255,251,248,0.86)]">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#8f1c48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
      <h3 className="mb-2 text-2xl font-semibold text-[var(--app-text)]">Chưa có template</h3>
      <p className="max-w-sm text-sm text-[var(--app-text-soft)]">
        Danh mục template đang được cập nhật. Thử tải lại sau để tiếp tục tạo quà.
      </p>
    </div>
  );
}

export default function CreatePage() {
  const builder = useGiftBuilder();
  const {
    templates,
    stepIndex,
    direction,
    saving,
    error,
    giftResponse,
    selectedTemplate,
    selectedTemplateId,
    message,
    floatingMessagesInput,
    senderName,
    recipientName,
    images,
    audioTrack,
    customValues,
    giftData,
    currentStep,
    canProceed,
    setMessage,
    setFloatingMessagesInput,
    setSenderName,
    setRecipientName,
    setImages,
    setAudioTrack,
    setSceneElements,
    letterHeading,
    setLetterHeading,
    letterSignature,
    setLetterSignature,
    handleSelectTemplate,
    handleCustomFieldChange,
    goNext,
    goBack,
    handleSave,
  } = builder;

  const isSceneEditor =
    selectedTemplate?.editorSchema &&
    (selectedTemplate.editorSchema as { mode?: string }).mode === "scene-editor-2.5d" &&
    selectedTemplateId !== "flower-tree";

  return (
    <div className="min-h-screen px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="glass-panel rounded-[26px] px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-[rgba(96,61,77,0.22)] bg-white/70 px-4 text-sm font-semibold text-[var(--app-text)] transition-colors hover:bg-white"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Về trang chủ
            </Link>

            <div className="text-center">
              <p className="text-xs font-semibold uppercase text-[var(--app-brand)]">Gift Studio</p>
              <h1 className="text-2xl font-semibold text-[var(--app-text)]">Tạo món quà cá nhân hóa</h1>
            </div>

            <div className="min-w-[180px] rounded-[14px] border border-[rgba(96,61,77,0.22)] bg-white/70 px-3 py-2 text-right">
              <p className="text-xs text-[var(--app-text-soft)]">Bước hiện tại</p>
              <p className="text-sm font-semibold text-[var(--app-brand)]">{stepIndex + 1}/4</p>
            </div>
          </div>

          <div className="mt-4 border-t border-[rgba(96,61,77,0.14)] pt-3">
            <StepIndicator currentIndex={stepIndex} />
          </div>
        </header>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </motion.div>
        )}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="glass-panel rounded-[26px] p-4 sm:p-5">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 240, damping: 28 }}
              >
                {currentStep === "template" && (
                  <div>{templates.length > 0 ? (
                    <TemplateSelector
                      templates={templates}
                      selectedId={selectedTemplateId}
                      onSelect={handleSelectTemplate}
                    />
                  ) : (
                    <EmptyTemplates />
                  )}</div>
                )}

                {currentStep === "customize" && (
                  <div className="space-y-7">
                    <MessageEditor
                      value={message}
                      onChange={setMessage}
                      floatingMessagesInput={floatingMessagesInput}
                      onFloatingMessagesChange={setFloatingMessagesInput}
                      senderName={senderName}
                      recipientName={recipientName}
                      onSenderChange={setSenderName}
                      onRecipientChange={setRecipientName}
                      letterHeading={letterHeading}
                      letterSignature={letterSignature}
                      onLetterHeadingChange={setLetterHeading}
                      onLetterSignatureChange={setLetterSignature}
                    />

                    <ImageUploader images={images} onImagesChange={setImages} />
                    <AudioUploader audio={audioTrack} onAudioChange={setAudioTrack} />

                    {isSceneEditor && (
                      <SceneEditor
                        images={images}
                        defaultElements={buildDefaultFlowerTreeScene(images).elements}
                        onChange={setSceneElements}
                      />
                    )}

                    {selectedTemplate && selectedTemplate.customizableFields.length > 0 && (
                      <CustomizationPanel
                        fields={selectedTemplate.customizableFields}
                        values={customValues}
                        onChange={handleCustomFieldChange}
                      />
                    )}
                  </div>
                )}

                {currentStep === "preview" && selectedTemplate && (
                  <LivePreview gift={giftData} TemplateComponent={selectedTemplate.renderWeb} />
                )}

                {currentStep === "preview" && !selectedTemplate && (
                  <div className="flex min-h-[220px] items-center justify-center rounded-[18px] border border-[rgba(96,61,77,0.15)] bg-white/60 px-4 text-center text-[var(--app-text-soft)]">
                    Chưa chọn template. Vui lòng quay lại bước đầu để tiếp tục.
                  </div>
                )}

                {currentStep === "share" && giftResponse && <ShareStep giftResponse={giftResponse} />}

                {currentStep === "share" && !giftResponse && (
                  <div className="flex min-h-[220px] items-center justify-center rounded-[18px] border border-[rgba(96,61,77,0.15)] bg-white/60 px-4 text-center text-[var(--app-text-soft)]">
                    Chưa lưu quà tặng. Vui lòng quay lại bước preview.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {currentStep !== "share" && (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(96,61,77,0.14)] pt-5">
                <Button
                  variant="ghost"
                  onClick={goBack}
                  disabled={stepIndex === 0}
                  className={stepIndex === 0 ? "invisible" : ""}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Quay lại
                </Button>

                {currentStep === "preview" ? (
                  <Button variant="primary" size="lg" onClick={handleSave} loading={saving} disabled={saving}>
                    Lưu và tạo link chia sẻ
                  </Button>
                ) : (
                  <Button variant="primary" onClick={goNext} disabled={!canProceed}>
                    Tiếp theo
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Button>
                )}
              </div>
            )}
          </section>

          <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
            <div className="glass-panel rounded-[24px] p-4">
              <h2 className="text-lg font-semibold text-[var(--app-text)]">Preview stage</h2>
              <p className="mt-1 text-sm text-[var(--app-text-soft)]">
                Kiểm tra bố cục, motion và thông điệp trước khi publish.
              </p>
              {selectedTemplate ? (
                <div className="mt-4">
                  <LivePreview gift={giftData} TemplateComponent={selectedTemplate.renderWeb} />
                </div>
              ) : (
                <div className="mt-4 rounded-[16px] border border-[rgba(96,61,77,0.15)] bg-white/70 p-4 text-sm text-[var(--app-text-soft)]">
                  Chọn template để xem trước bố cục khung cảnh.
                </div>
              )}
            </div>

            <div className="rounded-[22px] border border-[rgba(96,61,77,0.16)] bg-[linear-gradient(145deg,#24161f,#4d1f3b)] p-4 text-white shadow-[0_22px_42px_-28px_rgba(32,12,25,0.9)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-champagne-200)]">Tip</p>
              <p className="mt-2 text-sm leading-relaxed text-white/84">
                Để quà trông đẹp hơn, nên dùng 2-4 ảnh theo cùng tone và viết thông điệp ngắn gọn 80-160 ký tự.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
