export default {
    methods: {
        getDirectionByAngle(angle){
            if(angle>=360 || angle<0 || angle==null || angle== 'null') return {jd:0,ms:"正北"};
            if((0<=angle && angle<=5)||(355<=angle && angle<360)) return {jd:0,ms:"正北"};
            if(5<angle && angle<=45) return {jd:1,ms:"正北偏东"};
            if(45<angle && angle<85) return {jd:1,ms:"正东偏北"};
            if(85<=angle && angle<=95) return {jd:2,ms:"正东"};
            if(95<angle && angle<=135) return {jd:3,ms:"正东偏南"};
            if(135<angle && angle<175) return {jd:3,ms:"正南偏东"};
            if(175<=angle && angle<=185) return {jd:4,ms:"正南"};
            if(185<angle && angle<=225) return {jd:5,ms:"正南偏西"};
            if(225<angle && angle<265) return {jd:5,ms:"正西偏南"};
            if(265<=angle && angle<=275)return {jd:6,ms:"正西"};
            if(275<angle && angle<=315)return {jd:7,ms:"正西偏北"};
            if(315<angle && angle<355) return {jd:7,ms:"正北偏西"};
        },
        getMarkerIconByType (direction){
            var icon = "";
            icon = "offline/" + direction + ".png";
            return icon;
        }
    }
}