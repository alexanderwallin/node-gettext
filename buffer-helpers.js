var jspack = require("./vendor/jspack/jspack").jspack;

function bufferReset(){
    this._current_position = 0;
}

function bufferSeek(position){
    if(isNaN(this._current_position)){
        this._current_position = 0;
    }
    
    position = Math.abs(position) || 0;
    
    if(position>this.length){
        position = this.length;
    }
    this._current_position = position;
}

function bufferRead(bytes){
    var data;
    if(isNaN(this._current_position)){
        this._current_position = 0;
    }
    
    bytes = Math.abs(!isNaN(bytes) ? bytes : this.length - this._current_position);
    
    if(this._current_position + bytes > this.length){
        bytes = this.length - this._current_position;
    }
    
    if(!bytes){
        return new Buffer(0);
    }
    
    data = new Buffer(bytes);
    this.copy(data, 0, this._current_position, this._current_position += bytes);
    return data;
}

function bufferFindAll(data, offset){
    var data = Buffer.isBuffer(data) && data || new Buffer(data);
    
    var i = offset || 0, j=0, pos=[];
    
    if(!this.length || !data.length){
        return pos;
    }
    
    while(1){
        
        if(this[i] == data[j]){
            if(j == data.length - 1){
                pos.push(i-j);
                j=0;
            }else{
                j++;
            }
        }else if(j){
            j = 0;
            continue;
        }
        
        if(i >= this.length){
            break;
        }
        
        i++;
    }
    
    return pos;
}

function bufferSplit(data){
    var data = Buffer.isBuffer(data) && data || new Buffer(data);
    var i=0, pos = this.findAll(data), len = pos.length, parts = [],
        startPos, endPos;
    if(!this.length || !data.length){
        return parts;
    }
    pos.push(this.length)
    for(i=0; i<=len; i++){
        startPos = !i ? 0 : pos[i-1] + data.length;
        endPos = pos[i];
        buf = new Buffer(endPos-startPos);
        this.copy(buf, 0, startPos, endPos);
        parts.push(buf);
    }
    return parts;
}

function bufferEquals(data){
    var data = Buffer.isBuffer(data) && data || new Buffer(data);
    
    var i;
    
    if(this.length != data.length){
        return false;
    }
    
    for(i=this.length-1; i>=0; i--){
        if(this[i] != data[i]){
            return false;
        }
    }
    
    return true;
}

function numberPack(fmt){
    return new Buffer(jspack.Pack(fmt || 'i', [this]));
}

function bufferUnpack(fmt){
    var num = jspack.Unpack(fmt || 'i', this);
    return num && num.length ? num[0] : 0;
}

function bufferReadint(fmt){
    var data = this.read(4);
    return data.unpack(fmt);
}

if(!("reset" in Buffer.prototype)){
    Object.defineProperty(Buffer.prototype, "reset",{
        value: bufferReset,
        enumerable: false
    });
}

if(!("seek" in Buffer.prototype)){
    Object.defineProperty(Buffer.prototype, "seek",{
        value: bufferSeek,
        enumerable: false
    });
}

if(!("read" in Buffer.prototype)){
    Object.defineProperty(Buffer.prototype, "read",{
        value: bufferRead,
        enumerable: false
    });
}

if(!("readint" in Buffer.prototype)){
    Object.defineProperty(Buffer.prototype, "readint",{
        value: bufferReadint,
        enumerable: false
    });
}

if(!("findAll" in Buffer.prototype)){
    Object.defineProperty(Buffer.prototype, "findAll",{
        value: bufferFindAll,
        enumerable: false
    });
}

if(!("split" in Buffer.prototype)){
    Object.defineProperty(Buffer.prototype, "split",{
        value: bufferSplit,
        enumerable: false
    });
}

if(!("equals" in Buffer.prototype)){
    Object.defineProperty(Buffer.prototype, "equals",{
        value: bufferEquals,
        enumerable: false
    });
}

if(!("unpack" in Buffer.prototype)){
    Object.defineProperty(Buffer.prototype, "unpack",{
        value: bufferUnpack,
        enumerable: false
    });
}

if(!("pack" in Number.prototype)){
    Object.defineProperty(Number.prototype, "pack",{
        value: numberPack,
        enumerable: false
    });
}