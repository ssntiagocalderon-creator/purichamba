// Saca cada línea de texto de un PDF con su posición (para tablas a dos columnas). Uso: pdf_lineas archivo.pdf
import Foundation
import PDFKit
let args = CommandLine.arguments
guard args.count >= 2, let doc = PDFDocument(url: URL(fileURLWithPath: args[1])) else { exit(1) }
for i in 0..<doc.pageCount {
    guard let p = doc.page(at: i), let sel = p.selection(for: p.bounds(for: .mediaBox)) else { continue }
    let alto = p.bounds(for: .mediaBox).height
    for linea in sel.selectionsByLine() {
        let b = linea.bounds(for: p)
        let t = (linea.string ?? "").replacingOccurrences(of: "\t", with: " ").replacingOccurrences(of: "\n", with: " ")
        if t.trimmingCharacters(in: .whitespaces).isEmpty { continue }
        print(String(format: "%d\t%.0f\t%.0f\t%.0f\t%.0f\t", i + 1, b.minX, alto - b.maxY, b.maxX, alto - b.minY) + t)
    }
}
