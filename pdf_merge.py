#!/usr/bin/env python3
"""
pdf_merge.py - Merge multiple PDF files into one.
Part of Omni-Tools suite.

Usage: python3 pdf_merge.py input1.pdf input2.pdf [output.pdf]
"""

import sys
from PyPDF2 import PdfMerger
import os

def merge_pdfs(input_files, output_file="merged.pdf"):
    """Merge multiple PDF files into a single PDF."""
    if not input_files:
        print("Error: No input files provided.")
        print("Usage: python3 pdf_merge.py input1.pdf input2.pdf [output.pdf]")
        sys.exit(1)
    
    # Validate input files exist
    for f in input_files:
        if not os.path.exists(f):
            print(f"Error: File not found: {f}")
            sys.exit(1)
        if not f.lower().endswith('.pdf'):
            print(f"Warning: {f} may not be a PDF file.")
    
    merger = PdfMerger()
    
    print(f"Merging {len(input_files)} PDF(s)...")
    
    for pdf_file in input_files:
        try:
            merger.append(pdf_file)
            print(f"  ✓ Added: {pdf_file}")
        except Exception as e:
            print(f"  ✗ Error adding {pdf_file}: {e}")
            merger.close()
            sys.exit(1)
    
    # Write output
    try:
        merger.write(output_file)
        merger.close()
        print(f"\n✅ Successfully merged into: {output_file}")
        print(f"   Output size: {os.path.getsize(output_file) / 1024:.1f} KB")
    except Exception as e:
        print(f"\n✗ Error writing output: {e}")
        merger.close()
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("pdf_merge.py - Merge multiple PDF files")
        print("")
        print("Usage:")
        print("  python3 pdf_merge.py input1.pdf input2.pdf [output.pdf]")
        print("")
        print("Arguments:")
        print("  input*.pdf    PDF files to merge (in order)")
        print("  output.pdf    Output filename (default: merged.pdf)")
        sys.exit(1)
    
    # If last argument ends with .pdf and exists as a file, include it as input
    # Otherwise, treat it as output
    if len(sys.argv) > 2 and sys.argv[-1].lower().endswith('.pdf'):
        # Check if last arg is an existing file
        if os.path.exists(sys.argv[-1]):
            # It's an existing file, include in inputs
            input_files = sys.argv[1:]
            output_file = "merged.pdf"
        else:
            # It's the output filename
            input_files = sys.argv[1:-1]
            output_file = sys.argv[-1]
    else:
        input_files = sys.argv[1:]
        output_file = "merged.pdf"
    
    merge_pdfs(input_files, output_file)