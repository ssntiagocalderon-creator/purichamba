// Extrae el texto de un PDF con PDFKit (motor de macOS). Uso: swift pdf_texto.swift archivo.pdf [carpeta_png escala]
import Foundation
import PDFKit
import AppKit

let args = CommandLine.arguments
guard args.count >= 2, let doc = PDFDocument(url: URL(fileURLWithPath: args[1])) else {
    FileHandle.standardError.write("no se pudo abrir el PDF\n".data(using: .utf8)!); exit(1)
}
if args.count >= 4 {
    // Modo imagen: guarda cada página como PNG (para leer páginas escaneadas)
    let carpeta = args[2]; let escala = CGFloat(Double(args[3]) ?? 1.5)
    for i in 0..<doc.pageCount {
        guard let p = doc.page(at: i) else { continue }
        let caja = p.bounds(for: .mediaBox)
        let tam = NSSize(width: caja.width * escala, height: caja.height * escala)
        let img = p.thumbnail(of: tam, for: .mediaBox)
        if let tiff = img.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
           let png = rep.representation(using: .png, properties: [:]) {
            try? png.write(to: URL(fileURLWithPath: "\(carpeta)/pagina-\(String(format: "%02d", i + 1)).png"))
        }
    }
    print("páginas: \(doc.pageCount)")
} else {
    for i in 0..<doc.pageCount {
        print("=== página \(i + 1)")
        print(doc.page(at: i)?.string ?? "")
    }
}
