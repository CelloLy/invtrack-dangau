import Swal from 'sweetalert2';

export const customSwal = Swal.mixin({
  customClass: {
    confirmButton: 'btn-dark',
    popup: 'swal2-cute-popup'
  },
  buttonsStyling: false,
  background: '#ffffff',
  color: '#0f172a',
  backdrop: 'rgba(15, 23, 42, 0.35)'
});
