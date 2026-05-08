import Foundation

enum StageDirectory {
    static let officialMapURL = URL(
        string: "https://d3vhc53cl8e8km.cloudfront.net/hello-staging/wp-content/uploads/sites/21/2026/05/08131244/edclv_2026_de_festival_map_1080x1350_r05_blurred.jpg"
    )

    static let defaultStage = FestivalStage(
        id: "speedway-entry",
        name: "Speedway Entry",
        normalizedX: 0.50,
        normalizedY: 0.92,
        colorHex: "#F7F7FF"
    )

    static let stages: [FestivalStage] = [
        FestivalStage(id: "kinetic-field", name: "Kinetic Field", normalizedX: 0.48, normalizedY: 0.68, colorHex: "#FF4FD8"),
        FestivalStage(id: "cosmic-meadow", name: "Cosmic Meadow", normalizedX: 0.27, normalizedY: 0.23, colorHex: "#53E2FF"),
        FestivalStage(id: "circuit-grounds", name: "Circuit Grounds", normalizedX: 0.69, normalizedY: 0.27, colorHex: "#A5FF5F"),
        FestivalStage(id: "neon-garden", name: "Neon Garden", normalizedX: 0.70, normalizedY: 0.48, colorHex: "#FFE45F"),
        FestivalStage(id: "basspod", name: "Basspod", normalizedX: 0.30, normalizedY: 0.47, colorHex: "#FF6B6B"),
        FestivalStage(id: "wasteland", name: "Wasteland", normalizedX: 0.25, normalizedY: 0.66, colorHex: "#FF9F43"),
        FestivalStage(id: "quantum-valley", name: "Quantum Valley", normalizedX: 0.73, normalizedY: 0.68, colorHex: "#8E7CFF"),
        FestivalStage(id: "stereo-bloom", name: "Stereo Bloom", normalizedX: 0.52, normalizedY: 0.47, colorHex: "#4DFFB8"),
        FestivalStage(id: "bionic-jungle", name: "Bionic Jungle", normalizedX: 0.60, normalizedY: 0.58, colorHex: "#F86FFF"),
        FestivalStage(id: "art-cars", name: "Art Cars", normalizedX: 0.49, normalizedY: 0.82, colorHex: "#F8F4A6"),
        FestivalStage(id: "downtown-edc", name: "Downtown EDC", normalizedX: 0.41, normalizedY: 0.55, colorHex: "#7DE2D1")
    ]

    private static let aliases: [String: String] = [
        "kineticfield": "kinetic-field",
        "kinetic": "kinetic-field",
        "cosmicmeadow": "cosmic-meadow",
        "cosmic": "cosmic-meadow",
        "circuitgrounds": "circuit-grounds",
        "circuit": "circuit-grounds",
        "neongarden": "neon-garden",
        "neon": "neon-garden",
        "basspod": "basspod",
        "basspodstage": "basspod",
        "wasteland": "wasteland",
        "quantumvalley": "quantum-valley",
        "quantum": "quantum-valley",
        "stereobloom": "stereo-bloom",
        "bionicjungle": "bionic-jungle",
        "artcars": "art-cars",
        "artcar": "art-cars",
        "downtownedc": "downtown-edc",
        "downtown": "downtown-edc"
    ]

    static func stage(for id: String) -> FestivalStage {
        stages.first { $0.id == id } ?? defaultStage
    }

    static func stageID(containedIn text: String) -> String? {
        let normalizedText = normalized(text)

        for stage in stages where normalizedText.contains(normalized(stage.name)) {
            return stage.id
        }

        for (alias, stageID) in aliases where normalizedText.contains(alias) {
            return stageID
        }

        return nil
    }

    static func normalized(_ value: String) -> String {
        value
            .lowercased()
            .filter { $0.isLetter || $0.isNumber }
    }
}
