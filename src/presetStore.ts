// @core-web/mock-service-gui/src/presetStore.ts

export type Preset = {
  label: string;
  status: number;
  response: any;
};

export type HandlerInfo = {
  handlerId: symbol;
  method: string;
  path: string;
  presets: Preset[];
};

// 프리셋을 저장하고 관리하는 Store
class PresetStoreClass {
  private handlers: Map<symbol, HandlerInfo> = new Map();
  private selectedPresets: Map<symbol, Preset | null> = new Map();

  // 핸들러 등록
  registerHandler(handlerId: symbol, handlerInfo: HandlerInfo) {
    this.handlers.set(handlerId, handlerInfo);
    this.selectedPresets.set(handlerId, null);
  }

  // 핸들러 정보 가져오기
  getHandlerInfo(handlerId: symbol): HandlerInfo | undefined {
    return this.handlers.get(handlerId);
  }

  // 선택된 프리셋 설정
  setSelectedPreset(handlerId: symbol, presetLabel: string) {
    const handlerInfo = this.getHandlerInfo(handlerId);
    if (handlerInfo) {
      const preset =
        handlerInfo.presets.find((p) => p.label === presetLabel) || null;
      this.selectedPresets.set(handlerId, preset);
    }
  }

  // 선택된 프리셋 가져오기
  getSelectedPreset(handlerId: symbol): Preset | null {
    return this.selectedPresets.get(handlerId) || null;
  }
}

// 싱글톤 PresetStore 인스턴스
export const PresetStore = new PresetStoreClass();
