module.exports = {
    getDate : function(){
        let today = new Date();
        let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let todayFormatted = today.toLocaleDateString("en-US", options);
        return todayFormatted
    }
}
