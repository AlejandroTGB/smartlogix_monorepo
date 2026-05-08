from schemas.auth_schema import LoginRequest

class AuthService:
    
    @staticmethod
    def autenticar_usuario(credenciales: LoginRequest):
        #MOCK TEMPORAL ANTES DE TENER DB REAL
        if credenciales.email == "admin@smartLogix.cl" and credenciales.password == "123":
            #exito
            return {
                "id": 1,
                "nombre": "Admin test",
                "rol": "admin",
                "token": "test-jwt-valido"
            }
            #fallo
        return None
