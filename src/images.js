export async function prepareImage(file,avatar=false){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Pilih gambar JPG, PNG, atau WebP.');
 if(file.size>5*1024*1024)throw Error('Ukuran gambar maksimal 5 MB.');
 const url=URL.createObjectURL(file);
 try{const img=new Image();img.src=url;await img.decode();
 const ratio=avatar?1:16/9,w=Math.min(img.width,img.height*ratio),h=w/ratio;
 const canvas=document.createElement('canvas');canvas.width=Math.min(Math.round(w),avatar?240:1100);canvas.height=Math.round(canvas.width/ratio);
 canvas.getContext('2d').drawImage(img,(img.width-w)/2,(img.height-h)/2,w,h,0,0,canvas.width,canvas.height);
 return canvas.toDataURL('image/webp',0.83);
 }finally{URL.revokeObjectURL(url)}
}
