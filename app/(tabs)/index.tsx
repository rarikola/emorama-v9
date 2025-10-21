import * as Papa from "papaparse";
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Image, ScrollView } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function Page() {
  const [permission, requestPermission] = useCameraPermissions();
  const [active, setActive] = useState(true);
  const [primaryEmotions, setPrimaryEmotions] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [rowIndex, setRowIndex] = useState(0);
  const [clusterImage, setClusterImage] = useState<string | null>(null);

  // --- CSV FETCH + PARSE ---
  useEffect(() => {
    const loadCSV = async () => {
      try {
        console.log("🔍 Fetching CSV from local server...");
        const res = await fetch("http://192.168.1.41:8000/emorama-v7/assets/emorama.csv");
        const csvText = await res.text();

        const results = Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        });

        console.log("✅ Parsed CSV sample rows:");
        console.log(results.data.slice(0, 2));
        console.log(`📄 Total rows parsed: ${results.data.length}`);

        if (results.data.length > 0) {
          setCsvData(results.data);
          const first = results.data[0];
          const emotions = [
            `${first.e1_label} (${first.e1_weight})`,
            `${first.e2_label} (${first.e2_weight})`,
            `${first.e3_label} (${first.e3_weight})`,
          ];
          setPrimaryEmotions(emotions);
          setClusterImage(first.Cluster_image);
          console.log("🎭 First row emotions:", emotions);
          console.log("🖼️ First cluster image:", first.Cluster_image);
        }
      } catch (err: any) {
        console.error("❌ Failed to fetch or parse CSV:", err.message);
      }
    };

    loadCSV();
  }, []);
  // --------------------------

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const topLabels = [
    "Vigilance", "Anticipation", "Interest",
    "Ecstasy", "Joy", "Serenity",
    "Admiration", "Trust", "Acceptance",
    "Amazement", "Surprise", "Distraction",
  ];

  const bottomLabels = [
    "Terror", "Fear", "Apprehension",
    "Grief", "Sadness", "Pensiveness",
    "Loathing", "Disgust", "Boredom",
    "Rage", "Anger", "Annoyance",
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top labels */}
      <View style={styles.labelsBlock}>
        {topLabels.map((emo, i) => (
          <View key={i} style={styles.labelBox}>
            <Text style={styles.label}>{emo}</Text>
          </View>
        ))}
      </View>

      {/* Camera */}
      <View style={styles.cameraBox}>
        {active ? (
          <CameraView style={{ flex: 1 }} facing="front" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={{ color: "#666" }}>Camera paused</Text>
          </View>
        )}
      </View>

      {/* Bottom labels */}
      <View style={styles.labelsBlock}>
        {bottomLabels.map((emo, i) => (
          <View key={i} style={styles.labelBox}>
            <Text style={styles.label}>{emo}</Text>
          </View>
        ))}
      </View>

      {/* Primary emotions from CSV */}
      <View style={{ marginTop: 6, marginBottom: 2 }}>
        {primaryEmotions.map((emo, i) => (
          <Text
            key={i}
            style={{
              fontSize: 13,
              color: "#333",
              textAlign: "center",
              lineHeight: 18,
            }}
          >
            {emo}
          </Text>
        ))}
      </View>

      {/* Cluster image preview */}
      {clusterImage && (
        <View style={{ alignItems: "center", marginVertical: 6 }}>
          <Text style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
            Cluster: {clusterImage}
          </Text>
          <Image
            source={{
              uri: `http://192.168.1.41:8000/emorama-v7/assets/${clusterImage}`,
            }}
            style={{
              width: 220,
              height: 220,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#ccc",
              backgroundColor: "#fff",
            }}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Buttons */}
      <View style={{ marginBottom: 40, alignItems: "center" }}>
        <Button
          title="Next Emotion Set"
          onPress={() => {
            if (csvData.length > 0) {
              const nextIndex = (rowIndex + 1) % csvData.length;
              const row = csvData[nextIndex];
              const emotions = [
                `${row.e1_label} (${row.e1_weight})`,
                `${row.e2_label} (${row.e2_weight})`,
                `${row.e3_label} (${row.e3_weight})`,
              ];
              setPrimaryEmotions(emotions);
              setClusterImage(row.Cluster_image);
              setRowIndex(nextIndex);
              console.log(`➡️ Showing row ${nextIndex}, image: ${row.Cluster_image}`);
            }
          }}
        />

        <View style={{ height: 8 }} />

        <Button
          title={active ? "Pause Camera" : "Start Camera"}
          onPress={() => setActive(!active)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 40,
    paddingBottom: 20,
  },
  labelsBlock: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    marginVertical: 5,
    gap: 4,
  },
  labelBox: {
    width: "30%",
    paddingVertical: 8,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    color: "#222",
  },
  cameraBox: {
    width: "90%",
    height: 250,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 10,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

