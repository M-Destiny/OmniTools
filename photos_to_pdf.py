#!/usr/bin/env python3
"""
photos_to_pdf.py - Convert image files to a single PDF.
Part of Omni-Tools suite.

Usage: python3 photos_to_pdf.py image1.jpg image2.png [output.pdf]
"""

import sys
from PIL import Image
import os

def images_to_pdf(input_files, output_file="images.pdf"):
    """Convert multiple image files to a single PDF."""
    if not input_files:
        print("Error: No input files provided.")
        print("Usage: python3 photos_to_pdf.py image1.jpg image2.png [output.pdf]")
        sys.exit(1)
    
    valid_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp')
    image_list = []
    
    print(f"Processing {len(input_files)} image(s)...")
    
    for img_file in input_files:
        if not os.path.exists(img_file):
            print(f"  ✗ File not found: {img_file}")
            continue
        
        if not img_file.lower().endswith(valid_extensions):
            print(f"  ⚠ Skipping unsupported file: {img_file}")
            continue
        
        try:
            img = Image.open(img_file)
            # Convert to RGB if necessary (e.g., for PNG with transparency or RGBA)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            image_list.append(img)
            print(f"  ✓ Added: {img_file}")
        except Exception as e:
            print(f"  ✗ Error processing {img_file}: {e}")
    
    if not image_list:
        print("\n✗ No valid images to convert.")
        sys.exit(1)
    
    try:
        # Save first image and append the rest
        first_image = image_list[0]
        remaining_images = image_list[1:] if len(image_list) > 1 else []
        
        first_image.save(
            output_file,
            "PDF",
            resolution=100.0,
            save_all=True,
            append_images=remaining_images
        )
        
        print(f"\n✅ Successfully created PDF: {output_file}")
        print(f"   Pages: {len(image_list)}")
        print(f"   Output size: {os.path.getsize(output_file) / 1024:.1f} KB")
        
        # Close all images
        for img in image_list:
            img.close()
            
    except Exception as e:
        print(f"\n✗ Error creating PDF: {e}")
        # Clean up
        for img in image_list:
            try:
                img.close()
            except:
                pass
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("photos_to_pdf.py - Convert images to PDF")
        print("")
        print("Usage:")
        print("  python3 photos_to_pdf.py image1.jpg image2.png [output.pdf]")
        print("")
        print("Arguments:")
        print("  Image files   JPG, PNG, GIF, BMP, TIFF, WebP supported")
        print("  output.pdf    Output filename (default: images.pdf)")
        print("")
        print("Examples:")
        print("  python3 photos_to_pdf.py photo1.jpg photo2.jpg")
        print("  python3 photos_to_pdf.py *.png output.pdf")
        sys.exit(1)
    
    # Determine if last argument is output file
    if len(sys.argv) > 2 and sys.argv[-1].lower().endswith('.pdf'):
        # Check if last arg exists as a file
        if os.path.exists(sys.argv[-1]):
            # Existing file, include in inputs
            input_files = sys.argv[1:]
            output_file = "images.pdf"
        else:
            # New output filename
            input_files = sys.argv[1:-1]
            output_file = sys.argv[-1]
    else:
        input_files = sys.argv[1:]
        output_file = "images.pdf"
    
    images_to_pdf(input_files, output_file)