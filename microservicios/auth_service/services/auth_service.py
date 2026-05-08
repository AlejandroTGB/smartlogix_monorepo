import bcrypt
from sqlalchemy.orm import Session
from models.user_model import UsuarioDB
from schemas.auth_schema import LoginRequest, RegisterRequest

class AuthService:
    @staticmethod
    def registrar_usuario(db: Session, datos: RegisterRequest):
        #lo primero, verificar si el correo ya existe en la db
        #es como un "userRepository.findbyEmail(email) en spring boot"
        usuario_existente = db.query(UsuarioDB).filter(UsuarioDB.email == datos.email).first()
        if usuario_existente:
            return None #Devolvemos none para que el router lance un error 400
        
        #encriptar la contraseña
        salt = bcrypt.gensalt()

        #Bcrypt necesita que los textos esten en bytes antes de encriptar:
        password_encriptada = bcrypt.hashpw(datos.password.encode('utf-8'), salt).decode('utf-8')

        #Crear un registro nuevo usando el Model
        nuevo_usuario = UsuarioDB(
            email=datos.email,
            password=password_encriptada,
            nombre=datos.nombre
        )

        #Guardar en la db nachei
        db.add(nuevo_usuario) #Lo preparamos para guardar
        db.commit()           #se guarda en la db
        db.refresh(nuevo_usuario) #actualiza el objeto con los datos de la db (como el id generado)

        #devolvemos el modelo completo al router
        return nuevo_usuario
    
    @staticmethod
    def autenticar_usuario(credenciales: LoginRequest):
        if credenciales.email == "admin@smartlogix.cl" and credenciales.password == "123":
            return {
                "id": 1,
                "nombre": "Pablo Admin",
                "rol": "administrador",
                "token": "jwt_valido_xyz789"
            }
        return None