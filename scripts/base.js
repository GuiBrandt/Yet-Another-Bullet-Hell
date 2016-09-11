//=============================================================================
// base.js
//
// Funções e classes básicas pra facilitar a criação do resto
//=============================================================================
"use strict";
//-----------------------------------------------------------------------------
// * Cria uma classe e a retorna
//      _super  : Nome da classe mãe
//      proto   : Protótipo da classe
//      props   : Objeto das propriedades (getters e setters) da classe
//-----------------------------------------------------------------------------
function __class(_super, proto, props) {
    if (!proto || typeof proto != 'object')
        throw new Error('Protótipo inválido para a classe');

    var klass = function() {
        this.initialize.apply(this, arguments);
    };

    if (!!_super) {
        __checkType(_super, 'function', '_super');

        klass.prototype = Object.create(_super.prototype);
        klass.prototype.__super__ = _super.prototype;
        klass.prototype.constructor = klass;
        for (var property in proto)
            klass.prototype[property] = proto[property];
    } else
        klass.prototype = proto;

    if (!!props) 
        if (typeof props != 'object')
            throw new Error('Propriedades inválidas');
        else
            Object.defineProperties(klass.prototype, props);

    return klass;
}
//-----------------------------------------------------------------------------
// * Verifica o tipo de um parâmetro e lança um erro se for inválido
//      val     : Valor recebido como parâmetro
//      type    : Tipo esperado
//      name    : Nome do parâmetro (para a mensagem de erro)
//-----------------------------------------------------------------------------
function __checkType(val, type, name) {
    if (typeof val != type)
        throw new Error('Tipo inválido para `' + name + "'");
}
//-----------------------------------------------------------------------------
// * Verifica a classe de um parâmetro e lança um erro se for inválido
//      val     : Valor recebido como parâmetro
//      _class  : Classe esperada
//      name    : Nome do parâmetro (para a mensagem de erro)
//-----------------------------------------------------------------------------
function __checkClass(val, _class, name) {
    if (typeof val != 'object' || !(val instanceof _class))
        throw new Error('Tipo inválido para `' + name + "'");
}
//-----------------------------------------------------------------------------
// * Verifica se um número está entre outros dois
//      a, b    : Números entre os quais o primeiro número deve estar
//-----------------------------------------------------------------------------
Number.prototype.between = function(a, b) {
    __checkType(a, 'number', 'a');
    __checkType(b, 'number', 'b');

    var max = a > b ? a : b,
        min = a < b ? a : b; 
    return this >= min && this <= max;
};
//-----------------------------------------------------------------------------
// * Retorna um clone do objeto
//-----------------------------------------------------------------------------
Object.prototype.clone = function() {
    var clone = Object.create(this);
    if (this instanceof Array) {
        for (var i = 0; i < this.length; i++) {
            if (!!this[i] && typeof this[i] == 'object')
                clone[i] = this[i].clone();
            else
                clone[i] = this[i];
        }
    } else {
        for (var property in this) {
            if (!this.hasOwnProperty(property))
                continue;
            if (!!this[property] && typeof this[property] == 'object')
                clone[property] = this[property].clone();
            else
                clone[property] = this[property];
        }
    }
    return clone;
};
//-----------------------------------------------------------------------------
// * Verifica se um elemento existe no Array
//      obj     : Objeto a verificar
//-----------------------------------------------------------------------------
Array.prototype.contains = function(obj) {
    for (var i = 0; i < this.length; i++)
        if (this[i] == obj) return true;
    return false;
};
//-----------------------------------------------------------------------------
// * Apaga um objeto do Array
//      obj     : Objeto a apagar
//-----------------------------------------------------------------------------
Array.prototype.remove = function(obj) {
    this.splice(this.indexOf(obj), 1);
};