import bcrypt
from sqlalchemy.orm import Session
from models.user_model import UsuarioDB
from schemas.auth_schema import LoginRequest, RegisterRequest
from core.security import crear_token_acceso

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
    def autenticar_usuario(db: Session, credenciales: LoginRequest):
        #buscamos al usuario en la db por su correo
        usuario_db = db.query(UsuarioDB).filter(UsuarioDB.email == credenciales.email).first()
        
        #si no existe devolvemos none (401)
        if not usuario_db:
            return None
        
        #verificamos la pass
        #bcrypt compara la clave ingresada (en bytes) con la clave guardada (en bytes)
        clave_ingresada_bytes = credenciales.password.encode('utf-8')
        clave_guardada_bytes = usuario_db.password.encode('utf-8')

        if not bcrypt.checkpw(clave_ingresada_bytes, clave_guardada_bytes):
            return None #password incorrecta xd
        
        #si todo esta ok armamos el paquete de respuesta
        #Generacion de token JWT
        #sub= de quien es el token en este caso el usario, id= para identificarlo univocamente, rol= para manejar autorizaciones en el futuro
        datos_token = {
            "sub": usuario_db.email,
            "id": usuario_db.id,
            "rol": usuario_db.rol
        }
        token_acceso = crear_token_acceso(datos_token)


        return {
            "id": usuario_db.id,
            "nombre": usuario_db.nombre,
            "rol": usuario_db.rol,
            "token": token_acceso
        }