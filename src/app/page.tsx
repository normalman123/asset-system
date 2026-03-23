"use client";

import { useEffect, useState } from "react";

type Asset = {
  id: string;
  name: string;
  assetCode?: string | null;
  assetType?: string | null;
  condition?: string | null;
};

const ORG_ID = "7a41d2b3-2b93-4974-a129-a9feddef3025";

export default function HomePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selected, setSelected] = useState<Asset | null>(null);

  useEffect(() => {
    fetch(`/api/orgs/${ORG_ID}/assets`)
      .then((res) => res.json())
      .then((data) => {
        console.log("데이터 로드:", data);
        setAssets(data.data || []);
      });
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>자산 목록</h1>

      {assets.length === 0 && <div>데이터 없음</div>}

      {assets.map((item) => (
        <div key={item.id} style={{ marginBottom: 10 }}>
          {item.name}

          <button
            style={{ marginLeft: 10 }}
            onClick={() => {
              console.log("클릭됨:", item);
              setSelected(item);
            }}
          >
            선택
          </button>
        </div>
      ))}

      <hr style={{ margin: "20px 0" }} />

      <h2>선택된 자산</h2>

      {/* 디버깅용 */}
      <div>selected 값: {selected ? selected.name : "null"}</div>

      {selected ? (
        <div>
          <div>이름: {selected.name}</div>
          <div>코드: {selected.assetCode}</div>
          <div>유형: {selected.assetType}</div>
          <div>상태: {selected.condition}</div>
        </div>
      ) : (
        <div>선택된 자산 없음</div>
      )}
    </main>
  );
}