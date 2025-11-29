// DTOs para autenticación
export const RegisterRequestDto = {
  nombre: '',
  email: '',
  password: '',
  telefono: ''
};

export const LoginRequestDto = {
  email: '',
  password: ''
};

export const UserDto = {
  userID: 0,
  nombre: '',
  email: '',
  telefono: '',
  avatarURL: '',
  fechaRegistro: ''
};