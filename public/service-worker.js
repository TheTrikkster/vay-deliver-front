self.addEventListener('install', e => {
  console.log('SW installé');
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  console.log('SW activé');
});
// vous pouvez gérer ici le fetch si besoin
self.addEventListener('fetch', () => {});
