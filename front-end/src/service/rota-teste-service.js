import AxiosConfig from "../config/AxiosConfig.js"

export default class RotaTesteService{
    receberMensagemOla(){
        return AxiosConfig.get("home")
    }
}