/**
 * 현재 사용하지 않고 있음.
 * 로컬 다운로드를 위한 유틸 함수
 */
export const downloadToLocal = async (jsonString: string) => {
  // S3 연결 전 임시로 로컬 다운로드
  const blob = new Blob([jsonString], { type: "application/json" });

  // 다운로드 링크 생성
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "edited_incourse_path.json";

  // 자동 다운로드 실행
  document.body.appendChild(link);
  link.click();

  // 정리
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const saveFileWithPicker = async (
  jsonString: string,
  suggestedName: string = "course-data.json"
) => {
  try {
    if ("showSaveFilePicker" in window) {
      const isGeoJson = suggestedName.endsWith(".geojson");
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: isGeoJson ? "GeoJSON files" : "JSON files",
            accept: isGeoJson
              ? { "application/geo+json": [".geojson"] }
              : { "application/json": [".json"] },
          },
        ],
      });

      const writable = await fileHandle.createWritable();
      await writable.write(jsonString);
      await writable.close();
    }
  } catch (error) {
    console.error("Causes error during file saving : ", error);
  }
};
