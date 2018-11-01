//
// All scripts (master, data, code, ui, maintainance, etc) should obey the
// following conventions:
//
// -- each script can define one and only one object.  eval() returns the
// result of evaluating the last statement of the script.  therefore, the
// last statement of all script should simply be the script obj.
// 
// -- has a "version" key
// 
// --  more to be added

// constants used during evaluation for dialog descriptions
var isMac = new Boolean(updater.app.platform.substr(0,3) == "MAC");
var isWin = new Boolean(updater.app.platform.substr(0,3) == "WIN");
var isReader = new Boolean((updater.app.viewerType.substr(0,6) == "Reader"));

var nextCheckText = (updater.app.getUpdaterString("IDS_PREFS_PANEL_NEXTCHECK"));
var manualNextCheck = (updater.app.getUpdaterString("IDS_PREFS_PANEL_MANUALNEXTCHECK"));
var checkForUpdatesText = (updater.app.getUpdaterString("IDS_PREFS_PANEL_CHECKTXT"));
var updateAcrobatNowText = (updater.app.getUpdaterString("IDS_UPDATE_ACROBAT_NOW"));
var updateReaderNowText = (updater.app.getUpdaterString("IDS_UPDATE_READER_NOW"));
var updateNotificationBtn = (updater.app.getUpdaterString("IDS_PREFS_PANEL_VIEW_NOTIFS"));
var showConfirmDlgText = (updater.app.getUpdaterString("IDS_UPDATE_AUTO_CONF_TXT"));
var displayStartupNotifDlgText = (updater.app.getUpdaterString("IDS_UPDATE_SHOW_NOTIF_TXT"));

// calcuate width of the button 
var gStaticTextWidth = 8;
//var gUpdateNowWidth =  (gStaticTextWidth * Math.max(updateAcrobatNowText.length, updateReaderNowText.length));
var gUpdateNowWidth = (gStaticTextWidth * updateNotificationBtn.length);

var ScriptObj = {

    version:"0.10",

    prodConfigToURLMap: {
      "Exchange-Pro": "pro",
      "Exchange" : "std",
      "Reader" : "rdr"
    },

    scriptRootTemplate: "_PRODCONF_/_PLATFORM_/_LANG_/",

    getScriptRootURL: function()
    {
      var prod, platform, lang;
      
      prod = this.prodConfigToURLMap[updater.app.viewerType];
      this.assert(prod.length > 0, "Invalid Product Config");
      
      platform = updater.app.platform.toLowerCase();

      var lang;

      var tier = this.getAppTier();

      // user is in cross tier config
      if (tier.toLowerCase() == "all") { lang = "all"; }
      else if (tier.toLowerCase() == "enu") { lang = "enu"; }
      else { lang = this.getDefLangForTier(tier).toLowerCase(); }

      var urlext = new String(this.scriptRootTemplate);

      urlext = urlext.replace(/_PRODCONF_/, prod);
      urlext = urlext.replace(/_PLATFORM_/, platform);
      urlext = urlext.replace(/_LANG_/, lang);
      
      updater.console.println("url ext = " + urlext);
      
      return updater.scriptRootURL + urlext;
    },
    
    getDSURL: function()
    {
        var dsfile = "DataScript.js";
        var ret = this.getScriptRootURL() + dsfile;
        return ret;
    },


    //
    // The App Tier and Language  API
    //
    // The Language code
    //
    //      {"DEU", "de-DE"},
    // 		{"ESP", "es-ES"},
    // 		{"FRA", "fr-FR"},
    // 		{"ITA", "it-IT"},
    // 		{"JPN", "ja-JP"},
    // 		{"NLD", "nl-NL"},
    // 		{"SVE", "sv-SE"},
    // 		{"SUO", "fi-FI"},
    // 		{"NOR", "no-NO"},
    // 		{"NON", "no-NO"},
    // 		{"DAN", "da-DK"},
    // 		{"KOR", "ko-KR"},
    // 		{"PTB", "pt-BR"},
    // 		{"CHS", "zh-CN"},
    // 		{"CHT", "zh-TW"},
    // 		{"ENU", "en-US"}
    //
  
    // language code id to description
    LangToDescMap:
    {
    "ENU" : "English",
    "JPN" : "Japanese",
    "CHT" : "Chinese Traditional",
    "CHS" : "Chinese Simplified",
    "KOR" : "Korean",
    "FRA" : "French",
    "DEU" : "German",
    "PTB" : "Portuguese Brazil",
    "ITA" : "Italian",
    "NLD" : "Dutch",
    "ESP" : "Spanish",
    "SVE" : "Swedish",
    "DAN" : "Danish",
    "SUO" : "Finish",
    "NOR" : "Norwegian",
    "HEB" : "Hebrew",
    "ARA" : "Arabic"
    },

    // Map either ISO4Char or RFC1766 to language code id
    CountryToLangMap: 
    {
    "en"    : "ENU",
    "en-us" : "ENU",
    "ja"    : "JPN",
    "ja-jp" : "JPN",
    "zh-tw" : "CHT",
    "zh-cn" : "CHS",
    "ko"    : "KOR", 
    "ko-kr" : "KOR",
    "fr"    : "FRA",
    "fr-fr" : "FRA",
    "de"    : "DEU",
    "de-de" : "DEU",
    "pt-br" : "PTB",
    "it"    : "ITA",
    "it-it" : "ITA",
    "nl"    : "NLD",
    "nl-nl" : "NLD",
    "es"    : "ESP",
    "es-sp" : "ESP",
    "sv"    : "SVE",
    "sv-se" : "SVE",
    "da"    : "DAN",
    "da-dk" : "DAN",
    "fi"    : "SUO",
    "fi-fi" : "SUO",
    "no"    : "NOR",
    "no-no" : "NOR",
    "he"    : "HEB",
    "he-il" : "HEB",
    "ar"    : "ARA",
    "ar-ae" : "ARA"
    },

    // TODO: need to update the tier map
    // Map Tier to lang in lang code id
    TierToLangsMap:
    {
    "EFG"  : ["FRA", "DEU"],
    "EFGJ" : ["FRA", "DEU", "JPN"],
    "JPN"  : ["JPN"],
    "CCK"  : ["CHT", "CHS", "KOR"],
    "DDS"  : ["DAN", "NLD", "ESP"],
    "NF"   : ["NOR", "SUO"],
    "SIP"  : ["SVE", "ITA", "PTB"]
    },

    // if the app is in a tier BUT running in ENU, which is always available,
    // then we need to have a default lang for the tier so that we know where
    // to fetch the correct DataScript from
    getDefLangForTier: function(tier) {
      var m = this.TierToLangsMap;
      for (var i in this.TierToLangsMap) {
        if (i.toLowerCase() == tier.toLowerCase()) {
          return m[i][0]; // the first element in array is the default lang
          }
        }
      updater.MasterScript.assert(false, "Invalid Tier: " + tier);
      return "ENU";  // just in case something really bad happens
    },

    getAppLang: function() {
      if ( ! updater.MasterScript.PropertyIsDefined(updater, "appLang") ||
           updater.appLang == null ) 
        {
        updater.appLang = updater.app.language;
        }
      return updater.appLang;
    },
  
    // Returns
    // 1. ENU iff ENU is the only lang the app has
    // 2. ALL if app has cross tier lang res
    // 3. one of the key in TierToLangsMap reflecting the tier app is in
    getAppTier: function() {

      if ( updater.MasterScript.PropertyIsDefined(updater, "appTier") &&
           updater.appTier != null ) {
        return updater.appTier;
        }

      updater.console.println("app is running with lang = " + this.getAppLang());
    
      // determine tier
      var res;
      try {
        res = this.getLangRes();
        }
      catch (e) {
        updater.console.println("Exception calling getLangRes()" + e);
        this.assert(false, "  getLangRes() exception");
        updater.console.println("  defaulting res to ENU");
        res = new Array();
        res[0] = "ENU";
        }
    
      updater.console.println("app has follow lang resources = " + res);

      if (res.length == 1) { 
        // if the app has ONLY single lang has, it MUST be ENU
        updater.MasterScript.assert(res[0] == "ENU", "Single Lang res MUST be ENU");
        updater.appTier = res[0];
        return res[0]; 
        }
    
      var dup = {};  // used as a boolean bitmap
      var t = Array();  // list of tiers
      
      // narrow down to Tiers given all the res available
      for ( var i in res ) {
        // skip ENU cause all config has ENU
        if (res[i] == "ENU") { continue; }

        var tier = this.mapLangToTier(res[i]);
        if ( ! updater.MasterScript.PropertyIsDefined(dup, tier) ) {
          dup[tier] = true;
          t.push(tier);
          }
        // updater.MasterScript.DumpObject(dup, "dup", true);
        }
      
      updater.console.println("app is in tier = " + t);
      
      if (t.length == 1) {
        updater.appTier = t[0];
        }
      else {
        updater.console.println("app is in Multi-Tier = " + t);
        updater.appTier = "ALL";
        }
      return updater.appTier;
    },
    
    mapLangToTier: function(lang) {
      var m = this.TierToLangsMap;
      for ( var tier in m ) {
        var langs = m[tier];
        for ( var i in langs) {
          if ( lang.toLowerCase() == langs[i].toLowerCase() ) return tier;
          }
        }
      updater.MasterScript.assert(false, "Input Lang invalid: " + lang);
    },

  
    // return array of resources in Country Code app has.
    // ENU MUST always be in the array.
    getLangRes: function() {
      var langRet = new Array();

      if (updater.app.platform == "WIN") {
        var type = updater.app.viewerType;
        var winLangFileBase;
        if ( type == "Reader" ) {
           winLangFileBase = "RdLang32";
          }
        else {
          winLangFileBase = "ExLang32";
          }
        var avSpCat = updater.fileSys.AVSpecialCategory;
        var avSpFold = updater.fileSys.AVSpecialFolder;
      
        var resRoot = updater.fileSys.GetSpecialFolder(avSpCat["kAVSCApp"], 
                                                       avSpFold["kAVSFRoot"]);
        updater.console.println("Enum items in mdPath: " + resRoot.mdPath);
        var files = updater.fileSys.enumFolderItems(resRoot.mdPath);
        var idx = 0;

        // win always have ENU
        langRet[idx++] = "ENU";
      
        for (var i = 0; i < files.length; i++) {
          //updater.console.println(" file = " + files[i].fileNameBase + "   ext = " + files[i].fileNameExt);
        
          if( files[i].isExistingFile  &&
              (this.getFileNameBase(files[i].fileName).toLowerCase() 
               == winLangFileBase.toLowerCase() ) )
            {
            var lcode = this.getFileNameExt(files[i].fileName).toLowerCase();
            updater.console.println(" lcode = " + lcode);
            if ( typeof(lcode) != "undefined" ) { langRet[idx++] = lcode; }
            }
          }
        }
      else if (updater.app.platform == "MAC") {
        var macLangFileExt = "lproj";
      
        var avSpCat = updater.fileSys.AVSpecialCategory;
        var avSpFold = updater.fileSys.AVSpecialFolder;
      
        var resRoot = updater.fileSys.GetSpecialFolder(avSpCat["kAVSCApp"], 
                                                       avSpFold["kAVSFRoot"]);
        // no special folder defined to access lang resource folder.
        // manually create the path from app root:
        //    /Acrobat 6.0.app/Contents/MacOS/
        // -->/Acrobat 6.0.app/Contents/Resources/
        var dip = new String(resRoot.diPath);
        var resPath = dip.replace(/MacOS/, "Resources");
        updater.console.println("Enum items in diPath: " + resPath);
        var files = updater.fileSys.enumFolderItems(resPath, true);
        var idx = 0;
      
        for (var i = 0; i < files.length; i++) {
          //updater.console.println(" file = " + files[i].fileNameBase + "   ext = " + files[i].fileNameExt);
        
          if( files[i].isExistingFolder  &&
              (this.getFileNameExt(files[i].fileName).toLowerCase() 
               == macLangFileExt.toLowerCase() ) )
            {
            var cnt = this.getFileNameBase(files[i].fileName).toLowerCase();
            // Mac may use underscore instead of dash in country lang code 
            // ie: "zh_cn" instead of "zh-cn".  
            // replace it with dash.
            cnt = cnt.replace(/_/, "-");
            var lcode = this.CountryToLangMap[cnt];
            updater.console.println(" cnt   = " + cnt);
            updater.console.println(" lcode = " + lcode);
            this.assert(lcode.length > 0, "Cannot find " + cnt + " in CountryToLangMap");
            if ( typeof(lcode) != "undefined" ) { langRet[idx++] = lcode; }
            }
          }
        }
      else {
        this.assert(false, "Unsupported platform : " + updater.app.platform);
        return null;
        }
    
      return langRet;
    },

    // base.ext
    getFileNameBase: function(fn) {
      var sep = fn.indexOf(".");
      if (sep == -1) return fn;
      return fn.substring(0, sep);
    },

    // base.ext
    getFileNameExt: function(fn) {
      var sep = fn.indexOf(".");
      if (sep == -1) return "";
      return fn.substring(sep + 1, fn.length);
    },


    // pop a dialog and return true if restart pending.
    checkPendingRestart: function(silent) 
    {
      var restartPending;
      
      if ( typeof(updater["restartPending"]) != "undefined") {
        updater.console.println("===> App Restart Pending!  Skip Running Updater");
        restartPending = updater.restartPending;
        
        // need restarting Acrobat...  
        if (! silent) {
          var title = updater.app.getUpdaterString("uisJSNeedRestartTitle");
          var type = updater.app.viewerType;
          var infoMsg;
          if ( type == "Reader" ) {
            infoMsg = updater.app.getUpdaterString("uisJSNeedRestartTxtRdr");
            }
          else {
            infoMsg = updater.app.getUpdaterString("uisJSNeedRestartTxtVwr");
            }
          updater.app.alert({nIcon:3, nType:0, cTitle:title, cMsg:infoMsg});  
          }
        }
      else {
        restartPending = false;
        }
      return restartPending;
    },

    // ALL MasterScript entry point MUST call init() before proceeding.
    // if init() returns false, caller should exit and not proceed.
    init: function(silent)
    {
      updater.console.println("MasterScript init() - silent = " + silent);
      
      if (updater.app.getUpdateDisabled()) {
        updater.console.println("   Updater Disabled!!");
        return false;
      }
      
      // checkPendingRestart is the only init func for now.
      // may have more MasterScript global init func later.
      var ret = this.checkPendingRestart(silent);

      // don't cont if restart pending
      var toCont = !ret;

      updater.console.println("MasterScript init() - to continue = " + toCont);
      return (toCont);
    },

    //
    // Main Entry point for doing manual or auto updates
    //
    // set force to true for manual update, otherwise, it determines if it is
    // time to update for the auto update case
    // 
    entryPoint: function(force)
    {
      force ? this.ManualUpdateAsync() : this.AutoUpdateAsync();
    },

    // 
    // utils function 
    //
    PropertyIsDefined: function( obj, propName )
    {
        var ret = (typeof( obj[ propName ] ) != "undefined");
        // updater.console.println("PropertyIsDefined returns " + ret + " for " + propName);
        return ret;
    },

    DumpStrObj: function (obj) {
      // updater.console.println("  ---- DumpStrObj -----");
      updater.console.println("  obj.length = " + obj.length);
      for (var i = 0; i < obj.length; i++) {
        updater.console.println("  charcode obj[" + i + "] = " + obj.charCodeAt(i));
      }
      // updater.console.println("  ---- DumpStrObj End -----");
    },
    
    // improve it to dump recursively later if i have time
    DumpObject: function (obj, str, vals) {
      if (! str ) str = "";
      else str = str + " ";
      str += "(" + obj + ") [" + typeof(obj) + "]\n";
      for (var p in obj) {
        str += "  " + p + ( vals ? ": " + obj[p] : "") + "\n";
      }
      updater.console.println(str);
    },

    DumpArray: function (array, str) {
      if (! str ) str = "";
      else str = str + " ";
      str += "(" + array + ") [" + typeof(array) + "]\n{ ";
      for( var i = 0;  i < array.length;  i++ ) {
		str += array[i] + ( i < array.length - 1 ? ", " : " }" );
      }
      updater.console.println(str);
    },

    GetFunctionName: function(f) {
      var name = f.toString().match(/(function .*\))/)[1];

      if ((name == null) || (name.length == 0))
        name = 'anonymous';

      return name;
    },

    StackTrace: function() 
    {
      var ret = '';
      for (var i = arguments.callee.caller; i != null; i = i.caller) {
        if (i) {
          ret += '> ' + this.GetFunctionName(i) + '\n';
        }
        // if (i.caller == i) {
        //           ret += '*';
        //           break;
        //         }
      }
      return ret;
    },

    assert: function(cond, details) {
      if (!cond) {
        var msg = "!!!!! Assert failure ";
        if (details) {
          msg = msg + " - " + details;
        }
        if (arguments.callee.caller != null) {
          msg = msg + "in " 
                + this.GetFunctionName(arguments.callee.caller)
                + ")";
        }
        msg = msg + "\n" + this.StackTrace();
        updater.console.println(msg);
      }
    },


    //
    // convert a string in generalized ASN1 time format to JS Date Object
    // returns null if conversion failed.  (it only support UTC as timezone.
    // cannot convert between timezones yet)
    // 
    // eg:
    // http last mod date:
	// Date: Thu, 07 Nov 2002 10:09:38 GMT
    // GEN_ASN1 eg1:
    // "20021107061101Z"
    //  012345678901234
    // 
    // GEN_ASN1 eg2:
    // "20021107061101.27Z"
    // 
    // GEN_ASN1 eg3:
    // "20021107061101.27-0200"
    //
    GenASN1ToDate: function (str) {

      var year, month, day, hours, mins, secs, ms, timezone;
      var timeStr = new String(str);

      // has to be at least 14 or more chars
      if (timeStr.length < 14) { return null; }

      year  = timeStr.substring(0 , 4);
      month = timeStr.substring(4 , 6);
      // zero based month used in JS Date
      month = month - 1;
      day   = timeStr.substring(6 , 8);
      hours = timeStr.substring(8 , 10);
      mins  = timeStr.substring(10, 12);
      secs  = timeStr.substring(12, 14);

//       updater.console.println(year);
//       updater.console.println(month);
//       updater.console.println(day);
//       updater.console.println(hours);
//       updater.console.println(mins);
//       updater.console.println(secs);

      
      // if more than 14 chars, ms and/or timezone may be present
      ms = 0; 
      timezone = "Z";

      if (timeStr.length > 14) {
        var plus, minus, zee, dot;
        dot =  timeStr.indexOf(".", 14);
        plus = timeStr.indexOf("+", 14);
        minus = timeStr.indexOf("-", 14);
        zee = timeStr.indexOf("Z", 14);

//         updater.console.println("dot = " + dot);        
//         updater.console.println("plus = " + plus);
//         updater.console.println("minus = " + minus);
//         updater.console.println("zee = " + zee);

        // check if . exists, if so, try parse ms
        //
        // FIXME: ms parsing is NOT correct here....
        // 0.5 should really be 500 ms, rather than 5 here.

        // must compare >= 0 to force numeric comparison instead of lexical
        if (dot >= 0) {
          if (zee >= 0) { ms = timeStr.substring( dot + 1, zee); }
          else if (plus >= 0) { ms = timeStr.substring( dot + 1, plus); }
          else if (minus >= 0) { ms = timeStr.substring( dot + 1, minus); } 
          else { ms = 0; }
        }

//        updater.console.println(ms);

        if (zee >= 0) { timezone = "Z"; }
        else if (plus >= 0) { timezone = timeStr.substring( plus, plus + 5); }
        else if (minus >= 0 ) { timezone = timeStr.substring( minus, minus + 5); }
        else { timezone = "Z"; }

//        updater.console.println("timezone = " + timezone);
      }

      //updater.console.println("returning");
      return new Date(Date.UTC(year, month, day, hours, mins, secs, ms));
    },

    // replace as many %s in str with replacements in array in order
    ReplacePrintfToken: function(str, array) {
      if (array.constructor != Array || array.length == 0) return str;
      if (str.constructor != String || str.length == 0) return str;

      var token = "%s";
      for (var i = 0; i < array.length; i++) {
        str = str.replace(token, array[i]);
        }
      
      return str;
    },

    // 
    // return Date Object
    // the first update time is 25 + [1-10] days from now
    CreateFirstUpdateTime: function()
    {
        var t = new Date(); // current time in UTC
        var fuss = ((Math.random() * 7) + 28) * (1000 * 60 * 60 * 24); // in ms
        var ms = t.getTime();
        ms += fuss;
        var first = new Date(ms);
        // updater.console.println("now = " + t);
        // updater.console.println("next = " + next);
 
        return first;
    },

    isTimeToUpdate: function()
    {
      // define nextCheckDate
      // updater.console.println("isTimeToUpdate()");

        if (!this.PropertyIsDefined(updater, "nextCheckDate")) {
          //updater.console.println("nextCheckDate not defined; define it now");
          updater.nextCheckDate = this.CreateFirstUpdateTime();
          updater.console.println("nextCheckDate = " + updater.nextCheckDate);          }

        //return true;

        var now = new Date();

        if (now.getTime() > updater.nextCheckDate.getTime()) {
            updater.console.println("-->It is time to do auto update");
            return true;
        } else {
            updater.console.println("-->It is NOT time to do auto update yet.  will check on:");
            updater.console.println(updater.nextCheckDate);
            return false;
        }
    },

    advanceNextCheckDate: function()
    {
        updater.console.println("advanceNextCheckDate()");
        var next_ms = updater.nextCheckDate.getTime() +  30 * (1000 * 60 * 60 * 24); // in ms
        var later = new Date(next_ms);
        updater.nextCheckDate = later;
    },

    loadState: function()
    {
      updater.console.println("updater loading store");
      try {
        updater.store.load();
        }
      catch (e) {
        updater.console.println("Exception in loadState(): " + e);
        updater.console.println("  --> skip loading store");
        }
      // updater.console.println("..loading nextCheckDate");
      if (this.PropertyIsDefined(updater.store.perUser, "nextCheckDate")) {
        updater.nextCheckDate = new Date(Date.parse(updater.store.perUser.nextCheckDate));
        updater.console.println(".. nextCheckDate = " + updater.nextCheckDate);
        }
      
      // viewed messages
      //updater.console.println("..loading viewedMessages");
      if (this.PropertyIsDefined(updater.store.perUser, "viewedMessages")) {
        updater.viewedMessages = updater.store.perUser.viewedMessages;
        //this.DumpObject(updater.viewedMessages);
        }
      else {
        updater.viewedMessages = {};
        }
    },

    
    saveState: function()
    {
      updater.console.println("updater saving store");
      //updater.console.println("..saving nextCheckDate");
      if (this.PropertyIsDefined(updater, "nextCheckDate")) {
        updater.store.perUser.nextCheckDate = updater.nextCheckDate.toUTCString();
        //updater.console.println("..saving nextCheckDate ok");
        }
          
      //updater.console.println("..saving viewedMessages");
      if (this.PropertyIsDefined(updater, "viewedMessages")) {
        updater.store.perUser.viewedMessages = updater.viewedMessages;
        //this.DumpObject(updater.viewedMessages);
        //updater.console.println("..saving viewedMessages ok");
        }

      try {
        updater.store.save();
        }
      catch (e) {
        updater.console.println("Exception in saveState(): " + e);
        throw new Error("SaveStateException");
        }
    },

    // will pop up a dialog warning user if no net connection is found
    checkNetConnection: function(skipUI) 
    {
      var hasNet; 
      if ( typeof(updater.net["isConnected"]) != "undefined") {
        hasNet = updater.net.isConnected();
        }
      else {
        hasNet = updater.dlm.hasNetAccess();
        }
      
      if (!hasNet && !skipUI) {
        var title = updater.app.getUpdaterString("bsJSNoNetConnectTitle");
        var errMsg = updater.app.getUpdaterString("bsJSNoNetConnectText");
        updater.app.alert({nIcon:0, nType:0, cTitle:title, cMsg:errMsg});
        return false;
      }
      else {
        return true;
      }
    },


    // dialog for missing component
    showMissingCompDialog: function(cName) {
      var text;
      var title = updater.app.getUpdaterString("csJSMissCompTitle");
      
      if (!cName || cName.length == 0) {
        text = updater.app.getUpdaterString("csJSMissCompText");
        }
      else {
        text = updater.MasterScript.ReplacePrintfToken(updater.app.getUpdaterString("csJSMissCompTextName"),
                                                       [cName]);
        }
      return updater.app.alert({nIcon:2, nType:2, cTitle:title, cMsg:text});
    },

    wellKnownCompDesc: {
      "Plugin/EBook" : function() {
        return updater.app.getUpdaterString("IDS_SAI_EBOOK_NAME");
      },
      
      "Plugin/MultiMedia": function() { 
        return updater.app.getUpdaterString("IDS_SAI_MULTIMEDIA_NAME");
      },
      
      "Plugin/PictureTasks": function() { 
        return updater.app.getUpdaterString("IDS_SAI_MULTIMEDIA_NAME");
      },

      "Annot/Screen": function() { 
        return updater.app.getUpdaterString("IDS_SAI_MULTIMEDIA_NAME");
      },

      "Annot/Movie": function() { 
        return updater.app.getUpdaterString("IDS_SAI_MULTIMEDIA_NAME");
      },

      "AsianFont/TChn": function() { 
        return updater.app.getUpdaterString("IDS_SAI_ASIANFONT_CHT_NAME");
      },

      "AsianFont/SChn": function() { 
        return updater.app.getUpdaterString("IDS_SAI_ASIANFONT_CHS_NAME");
      },

      "AsianFont/Japn": function() { 
        return updater.app.getUpdaterString("IDS_SAI_ASIANFONT_JPN_NAME");
      },
      
      "AsianFont/Kore": function() { 
        return updater.app.getUpdaterString("IDS_SAI_ASIANFONT_KOR_NAME");
      }
      },

    // First look up in updater.wellKnownCompDesc (maybe updated by
    // CodeScipt) if missing, then look up in
    // updater.MasterScript.wellKnownCompDesc (the default list)
    // returns a non zero length string if desc is known and found for comp
    lookUpWellKnownCompDesc: function(type, name) {
      var l;
      var key = type + "/" + name;
      if (updater.MasterScript.PropertyIsDefined(updater, "wellKnownCompDesc")) {
        updater.console.println("  using updater.wellKnownCompDesc");
        l = updater.wellKnownCompDesc;
        }
      else {
        updater.console.println("  using updater.MasterScript.wellKnownCompDesc"); 
        l = updater.MasterScript.wellKnownCompDesc;
        }
      if (! updater.MasterScript.PropertyIsDefined(l, key) ) {
        updater.console.println("  cannot find prop " + key);
        return null;
        }
      if (l[key].constructor == Function) {
        try {
          updater.console.println("  calling " + key + " as function");
          return l[key].call();
          }
        catch (e) {
          updater.console.println("Exception calling wellKnownCompDesc." + key);
          return null;
          }
        }
      else 
        return l[key];
    },

    // MasterScript Entry Point
    // app.findComponent()
    findComponent: function(type, name, desc, ver, params)
    {
      try {
        return this.FindComponentAsync(type, name, desc, ver, params);
        }
      catch (e) {
        updater.console.println("exception in findComponent: " + e);
        return false;
        }
    },

    // MasterScript Entry Point
    //   this is called by the idle proc
    CheckDLMState: function()
    {
      try {
        updater.MasterScript.asset(false, "CheckDLMState is obsoleted and should not be called.  DLM state checking is now done by AutoUpdateAsync");
        return;
        }
      catch (e) {
        updater.console.println("exception in CheckDLMState: " + e);
        }
    },


    // find out which message-only notification user has not read and pop up
    // modal dialogs
    popNotifications: function()
    {
      try {
        updater.console.println("  MasterScript popNotifications()");

        if ( ! this.init(true) ) return;

        updater.console.println("popNotifications()");

        // since called AFTER doUpdate(), just need to check if required
        // scripts exist. also, check user pref. if so, pop new notifications
        var notiEnable = updater.avpref.get("Updater", "ShowNotifDialog", 
                                            updater.avpref.type["Boolean"], false);
        // bail out if user doesn't want to see notifications
        if (!notiEnable) { return; }
        
        var hasAllScripts = updater.MasterScript.getAllScriptsFromStore();

        updater.console.println("notiEnable = " + notiEnable);
        updater.console.println("hasAllScripts = " + hasAllScripts);
        if (notiEnable && hasAllScripts) {
          updater.DataScript.entryPoint({func:"popNotifications", args:{}});
          }
        updater.console.println("popNotifications() Done");
        }
      catch (e) {
        updater.console.println("exception in popNotifications: " + e);
        return false;
        }
    },

    // URL utils
    urlGetProgUI: {
      cancelled: false,
      initialize: function(dialog) 
        {
          currentDialog = dialog;
          this.cancelled = false;
        },
      commit: function(dialog) {},
      close: function()
        {
          if(currentDialog)
            {
            currentDialog.end();
            return true;
            } else return false;
        },
      "cncl": function(dialog) {
        updater.console.println("  cancelled progress dialog");
        this.cancelled = true;
        this.close();
      },
      description: {
        name: updater.app.getUpdaterString("msJSChkForUpdtTitle"),
        elements:
        [
            {
            type: "view",
            align_children: "align_left",
            elements: [
                {
                type: "static_text",
                name: updater.app.getUpdaterString("msJSChkForUpdtText"),
                alignment: "align_center",
                width: 200
                },
                {
                type: "view",
                alignment: "align_fill",
                align_children: "align_fill",
                elements:[
                    {
                    type: "button",
                    item_id: "cncl",
                    name: updater.app.getUpdaterString("msJSChkForUpdtCancel"),
                    alignment: "align_center"
                    }
                  ]
                }
              ]
            }
        ]
      }
    },

    urlMonTask: function()
    {
      try {
        updater.console.println("enter gURLMonTask");
        var mon = updater.gURLMon;
        if (! mon.done) { 
          updater.console.println("     gURLMonTask waits...");
          mon.wait();
        }
        else {
          updater.console.println("     gURLMonTask got all...");
         if (updater.gURLMonTask) {
            updater.app.clearInterval(updater.gURLMonTask);
            updater.gURLMonTask = null;
           }
         updater.MasterScript.urlGetProgUI.close();
        }
        updater.console.println("exit gURLMonTask");
        }
      catch (e) {
        if (updater.gURLMonTask) {
          updater.app.clearInterval(updater.gURLMonTask);
          updater.gURLMonTask = null;
          }
        updater.MasterScript.urlGetProgUI.close();
        updater.console.println("Exception in URLMonTask" + e);
      }
    },

    // ifModSinceDate: js Date obj
    urlGetAsyncJSUI: function(url, ifModSinceDate)
    {
      updater.console.println("Enter urlGetAsyncUI");
      if (updater.gURLMonTask || updater.gURLMon ) {
        updater.console.println("gURLMonTask or gURLMon non-null! throwing...");
        throw new Error("Fatal error: urlGetAsyncUI is in progress!!");
      }

      var taskStr = "updater.MasterScript.urlMonTask();";
      
      updater.console.println("--- Added IdleProc");
      if (ifModSinceDate) {
        updater.gURLMon = updater.net.urlGetAsync(url, ifModSinceDate.toUTCString());
      }
      else {
        updater.gURLMon = updater.net.urlGetAsync(url);
      }
      updater.gURLMonTask = updater.app.setInterval(taskStr, 1000);
      updater.gURLMon.wait();
      updater.app.execDialog(this.urlGetProgUI);

      if ( this.urlGetProgUI.cancelled ) {
        if (updater.gURLMonTask) {
          updater.app.clearInterval(updater.gURLMonTask);
          updater.gURLMonTask = null;
        }
        updater.gURLMon.cancel();
        updater.gURLMon = null;

        updater.console.println("urlGetAyncUI cancelled!  throwing...");
        throw new Error("urlGetAyncUI cancelled");
      }
      var resp = updater.gURLMon.response;

      updater.gURLMonTask = null;
      updater.gURLMon = null;

      updater.console.println("Exit urlGetAsyncUI");
      updater.console.println(" http response status = " + resp["Status"]);
      return resp;
    },

    // ifModSinceDate: js Date obj
    // use blocking updater.net.urlGet
    urlGetUI: function(url, ifModSinceDate, closeUI)
    {
      updater.console.println("Enter urlGetUI");

      // for backward compatibility
//       if ( !this.PropertyIsDefined(updater.app, "showProgressDialog") ) {
//         var resp;
//         if (ifModSinceDate) {
//           updater.console.println(" -- pt 1 ");          
//           resp = updater.net.urlGet(url, ifModSinceDate.toUTCString());
//           this.DumpObject(ifModSinceDate);
//           updater.console.println(" -- pt 2 "); 
//         }
//         else {
//           resp = updater.net.urlGet(url);
//         }
//         return resp;
//       }

      // new
      if (!updater.isAutoUpdate) {
        updater.app.showProgressDialog();
      }
      updater.app.processDialogEvent();

      var resp;
      if (ifModSinceDate) {
        updater.console.println(" start urlGet() using if-mod-since");
        resp = updater.net.urlGet(url, ifModSinceDate.toUTCString());
        updater.console.println(" done urlGet()");
        }
      else {
        updater.console.println(" start urlGet()");
        resp = updater.net.urlGet(url);
        updater.console.println(" done urlGet()"); 
        }

      updater.app.processDialogEvent();
      if (closeUI) {
        updater.app.hideProgressDialog();
        }

      // this.DumpObject(resp);

      if ( updater.app.isProgressDialogCancelled() ) {
        throw new Error("ProgressDialog Cancelled");
        }
      
      updater.console.println("Exit urlGetUI");
      return resp;
    },


    // ifModSinceDate: js Date obj
    // use Async updater.net.urlGetAsync
    urlGetAsyncUI: function(url, ifModSinceDate, closeUI)
    {
      updater.console.println("Enter urlGetUIAsync");

      // new
      // updater.isAutoUpdate is a gloabl
      if (! updater.isAutoUpdate) {
        updater.app.showProgressDialog();
      }

      var mon;
      if (ifModSinceDate) {
        updater.console.println(" calls updater.net.urlGetAsync() using if-mod-since");
        mon = updater.net.urlGetAsync(url, ifModSinceDate.toUTCString());
        }
      else {
        updater.console.println(" calls updater.net.urlGetAsync()");
        mon = updater.net.urlGetAsync(url);
        }

      // loop for waiting for async get
      updater.console.println(" start looping url mon");
      while (! mon.done) {
        //updater.console.println("  ...waiting mon");
        updater.app.processDialogEvent();
        mon.wait();
        updater.app.processDialogEvent();
        if ( updater.app.isProgressDialogCancelled() ) {
          updater.console.println("  ...cancelling mon");
          mon.cancel(); 
          // updater.app.processDialogEvent();
          updater.app.hideProgressDialog();
          throw "URLGetCancelled";
          }
        }
      if (closeUI) {
        updater.app.hideProgressDialog();
        }

      var resp = mon.response;

      updater.console.println("Exit urlGetUIAsync");
      return resp;
    },

    //
    // FixUp the cacheScriptName so that it is product and language
    // dependent
    // eg: cachedMasterScript -> cachedMasterScript_Exchange-Pro_JPN
    //     cachedDataScript -> cachedDataScript_Reader_FRA
    //
    FixUpCacheScriptName: function(str) {
      var ret = str + "_" + updater.app.viewerType + "_" + updater.app.language;
      return ret;
    },
    // 
    // updater.tmp
    // updater.MasterScript
    // updater.DataScript
    // updater.CodeScript
    // updater.UIScript
    //

    //
    // updater.store.perUser:
    //   cachedMasterScript = { cachedDate: Date, scriptObj: script };
    //   cachedDataScript
    //   cachedCodeScript
    //   cachedUIScript
    //   nextCheckDate
    // 
    // CachedScript obj is like { cachedDate: Date, scriptObj: script };
    //
    
    // The input scriptCacheName are cachedMasterScript, cachedDataScript,
    // cachedCodeScript, cachedUIScript, etc.
    // 
    // scriptCacheName are postpended with prodConfig and Lang:
    // eg: cachedMasterScript -> cachedMasterScript_Exchange-Pro_JPN
    //     cachedDataScript -> cachedDataScript_Reader_FRA
    //
    // the postpended names are the actually names used in udstore.js
    //
    GetCachedScriptObj: function(serializationRoot, // updater.store.perUser
                                 scriptCacheName) // cachedDataScript, name for a CachedScript obj
    {
      updater.console.println("  GetCachedScriptObj()");
      var cachedScriptObj = null;
      
      // Should validate input params here!
      if (! scriptCacheName || scriptCacheName.length <=0 ) { throw "InvalidCachedName"; };
      
      scriptCacheName = this.FixUpCacheScriptName(scriptCacheName);
      updater.console.println("  scriptCacheName = " + scriptCacheName);
      
      // var serializationRoot = updater.store.perUser;
      
      // Do we have a cached data script object? If so, grab the date
      // associated with it.  This represents the moddate (in server-time) of
      // the data.

      try {
        // try finding cachedScriptModDate from presisted script
        if ( this.PropertyIsDefined(serializationRoot, scriptCacheName) ) {

          // Looks like we have a cached data script obj.  Just to be safe,
          // we'll ensure that it has the required keys
          // var cachedScriptObj = serializationRoot.cachedDataScript;
          cachedScriptObj = serializationRoot[scriptCacheName];

          // the cachedScriptObj must have prop scriptObj and cachedData
          if ( !this.PropertyIsDefined( cachedScriptObj, "scriptObj" ) || !this.PropertyIsDefined( cachedScriptObj, "cachedDate" ) ) {
            updater.console.println("   corrupted scriptobj");
            // missing a critical prop! nuke the cache info
            // delete serializationRoot.cachedDataScript;
            delete serializationRoot[scriptCacheName];
            }
            // else {
            // setup to use the moddate of the data JS in an if-modified-since query
            // cachedScriptModDate = new Date(Date.parse(cachedScriptObj.cachedDate));
            //updater.console.println("  cachedScriptObj.cachedDate = " + cachedScriptModDate);
            // }

          // if older version of DataScript < 0.02
          // updater.console.println("  cachedScript version = " + cachedScriptObj.scriptObj.version);
          
          //if (cachedScriptObj.scriptObj.version < "0.02") {
          //updater.console.println(" has older DataScript.  force loading new one");
          //cachedScriptModDate = null;
          //}
          }
        }
      catch (e) {
        updater.console.println(" exception in finding out cachedScriptModDate ");
        updater.console.println(" setting cachedScriptModDate to null");
      }
      return cachedScriptObj;
    },

    GetCachedScriptModDate: function(cachedScriptObj)
    {
      updater.console.println("  GetCachedScriptModDate()");
      var cachedScriptModDate = null; 
      if ( cachedScriptObj && this.PropertyIsDefined( cachedScriptObj, "cachedDate" ) ) {
        cachedScriptModDate  = new Date(Date.parse(cachedScriptObj.cachedDate));
        }
      return cachedScriptModDate;
    },

    // returns a resp obj
    DownloadScript: function(scriptURL, cachedScriptModDate)
    {
      updater.console.println("  DownloadScript()");
      var resp;
      try {
        if (cachedScriptModDate) {
          updater.console.println("  Using if-mod-since");
          if (updater.useSyncRead) {
            resp = this.urlGetUI(scriptURL, cachedScriptModDate);
            }
          else {
            resp = this.urlGetAsyncUI(scriptURL, cachedScriptModDate);
            }
          }
        else {
          updater.console.println("  NOT Using if-mod-since");
          if (updater.useSyncRead) {
            resp = this.urlGetUI(scriptURL);
            }
          else {
            resp = this.urlGetAsyncUI(scriptURL);
            }
          }
        }
      catch (e) {
        if (e == "URLGetCancelled") {
          throw "DownloadCancelled";
        }
        updater.console.println("Exception raised from updater.net.urlGet() or urlGetAsync() - " + e);
        updater.app.hideProgressDialog();
        throw "URLGetException";
        }
      return resp;
    },

    // return a scriptObj 
    GetAndCacheScriptObjFromResp: function(cachedScriptObj, resp, 
                                           serializationRoot, scriptCacheName)
    {
      updater.console.println("  GetAndCacheScriptObjFromResp()");
      scriptCacheName = this.FixUpCacheScriptName(scriptCacheName);
      updater.console.println("  scriptCacheName = " + scriptCacheName);

      // If we succesfully downloaded the data script, or if we got a not-modified result, we need to grab the
      // date returned by the server, which we'll use as our new last-check date.  This avoids clock skew
      // between the local machine and the server.
      var serverDate = null;

      updater.console.println("  checking response status");
      if (!resp || ! this.PropertyIsDefined(resp, "Status")) {
        updater.app.hideProgressDialog();
        throw "NoReponseStatus";
      }

      updater.console.println("  http response status = " + resp["Status"]);

      // if-modified-since case
      if (resp["Status"] == 304) {
        updater.console.println("  if-mod-since used since server response status = " + resp["Status"]);
        // used the cached datascript
        // updater.DataScript = cachedScriptObj.scriptObj;
        return cachedScriptObj.scriptObj;
        }

      // all other server error
      if (resp["Status"] != 200) {
        updater.app.hideProgressDialog();          
        throw "ServerError";
        }

      // Status = 200
      updater.console.println("  got newer content from server");
      // updater.console.println("resp.Content = " + resp.Content.substr(0, 30));
      // Get rid of the old cached data since it is out of date
      // delete serializationRoot.cachedDataScript;
      delete serializationRoot[scriptCacheName];
      
      if ( this.PropertyIsDefined( resp.Headers, "Date" ) ) {
        serverDate = this.GenASN1ToDate( resp.Headers["Date"] );
        updater.console.println("  Got Server Date ");
        }
      else {
        // illegal HTTP response without a Date header!
        updater.console.println("  illegal HTTP response without a Date header!  throw!");
        updater.app.hideProgressDialog();
        throw "NoDateHeader";
        }

      // Get the new moddate for the downloaded data out of the HTTP response headers.  Per HTTP 1.1 spec
      // section 14.25, we'll first try to get the Last-Modified header.  Failing this, we'll use the value
      // of the date header (which we retrieved above and stored in serverDate)
      var newModDate;
      if ( this.PropertyIsDefined( resp.Headers, "Last-Modified" ) ) {
        updater.console.println("  using Last-Modified to cache");
        newModDate = this.GenASN1ToDate( resp.Headers["Last-Modified"] );
        }
      else {
        updater.console.println("  using serverDate to cache");
        newModDate = serverDate;
        }
      updater.console.println("  newModDate = " + newModDate);
      
      // eval the returned data.  If this pukes, it'll throw.  We'll put in a check for null as well
      // just to be paranoid
      updater.console.println("  Eval resp.Content ");
      var newScriptObj = eval( resp.Content );
      if ( newScriptObj == null ) {
        updater.console.println("  Something wrong while eval resp.Content.  throws!");
        updater.app.hideProgressDialog();
        throw "BadData";
        }
        
      // Put the new cached data where it belongs
      updater.console.println("  Caching Content");
      // serializationRoot.cachedDataScript = { cachedDate : newModDate, scriptObj : newScriptObj };
      serializationRoot[scriptCacheName] = { cachedDate : newModDate, scriptObj : newScriptObj };
      
      // updater.DataScript = newScriptObj;
      return newScriptObj;
    },

    // return scriptObj
    downloadAndCacheScript: function(scriptURL,
                                     serializationRoot, // updater.store.perUser
                                     scriptCacheName // cachedDataScript, name for a CachedScript obj
                                     ) {

      if (! scriptURL || scriptURL.length <=0 ) { throw "InvalidScriptURL"; };
      updater.console.println("===== downloadAndCacheScript =====");
      updater.console.println("   url = " + scriptURL);

      var cachedScriptObj = null;
      cachedScriptObj = this.GetCachedScriptObj(serializationRoot, scriptCacheName);

      var cachedScriptModDate = null;
      cachedScriptModDate = this.GetCachedScriptModDate(cachedScriptObj);

      var resp = null;

      resp = this.DownloadScript(scriptURL, cachedScriptModDate);
      
      var scriptObj = null;
      scriptObj = this.GetAndCacheScriptObjFromResp(cachedScriptObj, resp, 
                                                    serializationRoot, scriptCacheName);

      return scriptObj;
    },


    // return a script or null
    getScriptFromStore: function(serializationRoot, 
                                 scriptCacheName) {
      if (updater.MasterScript.PropertyIsDefined(serializationRoot, scriptCacheName)) {
        updater.console.println("getScriptFromStore got " + scriptCacheName);
        return serializationRoot[scriptCacheName].scriptObj;
        
        }
      else {
        updater.console.println("getScriptFromStore returns null ");
        return null;
        }
    },
    // bring all scripts to runtime from store
    // only called by popNotifications().
    // will NOT go to net and fetch latest script
    // return true if all scripts exist
    getAllScriptsFromStore: function() {
      if (!updater.MasterScript.PropertyIsDefined(updater, "DataScript")) {
        var ret = updater.MasterScript.getScriptFromStore(updater.store.perUser, "cachedDataScript");
        if (ret != null) { updater.DataScript = ret; }
      }

      if (!updater.MasterScript.PropertyIsDefined(updater, "UIScript")) {
        var ret = updater.MasterScript.getScriptFromStore(updater.store.perUser, "cachedUIScript");
        if (ret != null) { updater.UIScript = ret; }
      }

      if (!updater.MasterScript.PropertyIsDefined(updater, "CodeScript")) {
        var ret = updater.MasterScript.getScriptFromStore(updater.store.perUser, "cachedCodeScript");
        if (ret != null) { updater.CodeScript = ret; }
      }

      return (updater.MasterScript.PropertyIsDefined(updater, "DataScript")
              && updater.MasterScript.PropertyIsDefined(updater, "UIScript")
              && updater.MasterScript.PropertyIsDefined(updater, "CodeScript"));
    },

    // Dev Tests
    
    getTestMasterURL: function()
    {
        var testmaster = "TestMaster.js";
        var ret = updater.scriptRootURL + testmaster;
        return ret;
    },


    testExec: function()
    {
      // this.findComponent("annotation", "bumper sticker");
      this.popNotifications();
      
//       var d1 = "20021107061101Z";
//       var d2 = "20010315182201.27Z";
//       var d3 = "20020910213422.56-0200";

//       var res = updater.MasterScript.GenASN1ToDate(d1);
//       updater.console.println(" d1 = " + res.toUTCString());

//       var res = updater.MasterScript.GenASN1ToDate(d2);
//       updater.console.println(" d1 = " + res.toUTCString());

//       var res = updater.MasterScript.GenASN1ToDate(d3);
//       updater.console.println(" d1 = " + res.toUTCString());

//       return;

      updater.console.println("Start Updater Test");

        var testMasterURL = this.getTestMasterURL();
        var testScript;
        try {
          var resp;
          // resp = this.urlGetAsyncUI(testMasterURL);
          resp = updater.MasterScript.urlGetUI(testMasterURL, null, true);
          updater.console.println("  Got TestMaster");
          updater.TestMaster = eval(resp.Content);
          updater.console.println("  Eval TestMaster done");

          if (this.PropertyIsDefined(updater, "TestMaster")) {
            updater.TestMaster.exec();
            }
          else {
            updater.console.println("  Cannot load TestMaster");
            }
        }
        catch (e) {
          updater.console.println("exception while fetching TestMaster:  " + e);
        }
    },
    
    


    // Pref Panel
    GetUpdaterPrefPanel: function() {
      var updatePanelName = updater.app.getUpdaterString("IDS_PREFS_PANEL_UPDATE");
      var monthlyText = updater.app.getUpdaterString("IDS_PREFS_PANEL_UPDATEMONTHLY");
      var manuallyText = updater.app.getUpdaterString("IDS_PREFS_PANEL_UPDATEMANUALLY");
      var gStaticTextHeight = 13;
      var gPrefsPanelWidth = 550;
      var gPrefsPanelHeight = 390;

      var updaterPrefPanel = {
      version: "0.01",

      // get all localized strings from getUpdaterString
//       l10n_init: function(dialog) {
//         updater.console.println("  l10n_init()");

//         // load up the l10n strings
//         //dialog.load( { "text" : this.updateDescText } );
//         // viewer and reader case

//         dialog.load({ "nctx" : this.nextCheckText });
//         dialog.load({ "cfut" : this.checkForUpdatesText });
//         dialog.load({ "Noti" : this.updateNotificationBtn });
//         dialog.load({ "conf" : this.showConfirmDlgText });
//         dialog.load({ "ShNo" : this.displayStartupNotifDlgText });
//       },

      // constants
      monthly: 1,
      manually: 0,
      
      nextCheckText: updater.app.getUpdaterString("IDS_PREFS_PANEL_NEXTCHECK"),
      manualNextCheck: updater.app.getUpdaterString("IDS_PREFS_PANEL_MANUALNEXTCHECK"),

      updateDescText: updater.app.getUpdaterString("IDS_PREFS_PANEL_UPDATEDESCTEXT"),
      updateDescTextReader: updater.app.getUpdaterString("IDS_PREFS_PANEL_UPDATEDESCTEXT_READER"),
      updateAcrobatNowText: updater.app.getUpdaterString("IDS_UPDATE_ACROBAT_NOW"),
      updateReaderNowText: updater.app.getUpdaterString("IDS_UPDATE_READER_NOW"),

      // dsiu: TODO: need to unwind this to CodeScript
      initialize: function(dialog) {
        updater.console.println("updaterPrefDialog initialize");

        // this.l10n_init(dialog);

        var freq = updater.app.getUpdateFrequency();
        updater.console.println("  freq = " + freq);

        var choices = {};
        if (freq == this.monthly) {
          updater.console.println("    using monthly");
          choices[monthlyText] = 1;
          choices[manuallyText] = 0;
          }
        else {
          updater.console.println("    using manually");
          choices[monthlyText] = 0;
          choices[manuallyText] = 1;
          }
        //dialog.load( { "Freq" : { "Every Month" : (freq == this.monthly) , 
        //"Manually" : (freq == this.manually) } } );
        dialog.load( {"Freq" : choices} );

        // widths 
        var date;
        if (freq==this.manually)
          date = this.manualNextCheck;
        else
          {
          if (!updater.MasterScript.PropertyIsDefined(updater, "nextCheckDate"))
            {
            updater.console.println("nextCheckDate not defined; define it now");
            updater.nextCheckDate = updater.MasterScript.CreateFirstUpdateTime();
            updater.console.println("nextCheckDate = " + updater.nextCheckDate);
            }
        
          date = "" + updater.nextCheckDate;
          }
        dialog.load( { "ckAc" : (date) } );

        var type = updater.app.viewerType;
        if ( type == "Reader" ) {
          dialog.load( { "text" : this.updateDescTextReader } );
          dialog.load( { "UpAc" : this.updateReaderNowText } );
          }
        else {
          dialog.load( { "text" : this.updateDescText } );
          dialog.load( { "UpAc" : this.updateAcrobatNowText } );
          }

        dialog.load( { "conf" : updater.app.getShowUpdateDialog() } );
        dialog.load( { "ShNo" : updater.app.getShowStartupNotifDialog() } );

        // FIXME: 
        // enable Notification button only when there are messages
        // downloaded AND not restart pending!
        var hasAllScripts = updater.MasterScript.getAllScriptsFromStore();
        var hasMsg;
        var hasMsgFunc = function(arg) {
          updater.console.println("arg.returnVal = " + arg.returnVal);
          hasMsg = (arg.returnVal > 0);
          updater.console.println("inner hasMsg = " + hasMsg);
        };

        if (hasAllScripts) {
          updater.DataScript.entryPoint({func: "GetNumMessages", 
                                         args:{}, callBack: hasMsgFunc,
                                         callBackArgArgs: null});
          };

        updater.console.println("outter hasMsg = " + hasMsg);
        var notiEnable = hasAllScripts && 
                         (! updater.MasterScript.checkPendingRestart(true))
                         && hasMsg;

        dialog.enable( { "Noti" : notiEnable } );
        dialog.createNotifier( { "UpAc" : 0, "Noti" : 0 } );
      },

      // dsiu: TODO: need to unwind this to CodeScript
      commit: function(dialog) {
        updater.console.println("updaterPrefDialog commit");

        // var val = dialog.store("Freq")["Freq"];
        var val = dialog.store("Freq")["Freq"];
        var isMan = val[manuallyText];
        var isMonth = val[monthlyText];

        updater.console.println(" isMan = " + isMan);
        updater.console.println(" isMon  = " + isMonth); 

        updater.app.setUpdateFrequency(isMan ? this.manually : this.monthly);
        updater.app.setShowUpdateDialog(dialog.store("conf" )["conf"]);
        updater.app.setShowStartupNotifDialog(dialog.store("ShNo" )["ShNo"]);
      },

      // dsiu: TODO: need to unwind this to CodeScript
      // manual update
      "UpAc": function(dialog) {
        updater.console.println("UpAc clicked");
        updater.MasterScript.entryPoint(true);
      },

      // dsiu: TODO: need to unwind this to CodeScript
      "Noti": function(dialog) {
        updater.console.println("Noti clicked");
        updater.DataScript.entryPoint({func:"ShowNotifDialog", args:{}});
      },

      description:
      {
      name: "Update Prefs Panel",
      margin_height: "0",
      margin_width: "0",
      elements: [
          {
          type: "cluster",
          name: (updatePanelName),
          dwidth: (gPrefsPanelWidth),
          dheight: (gPrefsPanelHeight),
          align_children: "align_left",
          elements: [
              {  
              type: "static_text",
              item_id: "text",
              alignment: "align_fill",
              height: (gStaticTextHeight*5)
              },

              {  
              type: "view",
              align_children: "align_row",
              alignment: "align_fill",
              elements: [
                  { 
                  type: "static_text",
                  item_id: "nctx",
                  name: (nextCheckText)
                  },
								
                  {
                  type: "static_text",
                  item_id: "ckAc",
                  alignment: "align_fill"
                  }
                ]
              },

              {
              type: "gap",
              height: (gStaticTextHeight)
              },

              {
              type: "view",
              align_children: "align_right",
              alignment: "align_center",
              elements: [
                  {
                  type: "view",
                  align_children: "align_row",
                  elements: [
                      {
                       type: "static_text",
                       item_id: "cfut",
                       alignment: "align_right",
                       name: (checkForUpdatesText)
                       },
                    
                      {
                      type: "popup",
                      item_id: "Freq",
                      width: (gUpdateNowWidth)
                      }
                    ]
                  },

//                    {
//                    type: "button",
//                    item_id: "UpAc",
//                    width: (gUpdateNowWidth),
//                    name: ""
//                    },

                  {
                  type: "button",
                  item_id: "Noti",
                  width: (gUpdateNowWidth),
                  name: (updateNotificationBtn)
                  }
                ]
              },
						
              {
              type: "gap",
              height: (gStaticTextHeight)
              },
            
              {
              type: "check_box",
              item_id: "conf",
              name: (showConfirmDlgText)
              },
            
              {
              type: "check_box",
              item_id: "ShNo",
              name: (displayStartupNotifDlgText)
              }
            ]
          }
        ]
      }
        };
      return updaterPrefPanel;
    }, // GetUpdaterPrefPanel

    // MasterScript Entry Point
    // called from idle proc
    InstallPrefPanel: function() 
    {
      try {
        updater.console.println("  MasterScript InstallPrefPanel()");
        if ( ! this.init(true) ) return;

        updater.console.println("InstallPrefPanel");
      
        if (!updater.prefPanelInstalled) {
          // var prefd = this.updaterPrefPanel;
          // var prefd = updater.MasterScript.updaterPrefPanel;
          // updater.app.createJSPrefsPanel(prefd, "Updates", "Updates");
          // try using a global off updater 
          updater.prefPanel = updater.MasterScript.GetUpdaterPrefPanel();
          updater.app.createJSPrefsPanel(updater.prefPanel, 
                                         updater.app.getUpdaterString("IDS_PREFS_PANEL_UPDATE"),
                                         "Updates");
          updater.prefPanelInstalled = true;
          updater.console.println("UpdaterPrefPanel installed");
          }
        else {
          updater.console.println("UpdaterPrefPanel already installed");
          }
        updater.console.println("InstallPrefPanel Done");
        return;
        }
      catch (e) {
        updater.console.println("exception in InstallPrefPanel: " + e);
        }
    },


    //
    // General way of creating a state machine 
    //
    SStartStateMachine : function(idleProc, idleArgs, 
                                  resumeProc, resumeArgs, 
                                  name, states)
    {
      if (this.PropertyIsDefined(updater, "gStateMachineLock") &&
          updater.gStateMachineLock == true) {
        updater.console.println("SStartStateMachine locked by " + 
                                updater.gStateMachine.name);
        throw "StateMachineInUse";
        }
      
      updater.gStateMachineLock = true;

      // TODO: add singleton
      updater.gStateMachine = new Object();
      var sm = updater.gStateMachine;

      sm.name = name;
      sm.enumStates = states;
      sm.state = states.StInit;
      sm.idleProc = idleProc;
      sm.idleArgs = idleArgs;
      sm.resumeProc = resumeProc;
      sm.resumeArgs = resumeArgs;
      sm.done = false;
      sm.error = false;
      sm.exception = null;
      // TODO: the interval in ms MUST BE greater than the ADM idle proc
      // otherwise cancel event won't be received!
      sm.handle = updater.app.setInterval(idleProc, 60);
    },


    // BgDl = Background downloading
    SBgDlStates : 
    {
      StInit: 0,
      StReadStart: 1,
      StReadWait: 2,
      StReadDone: 3,
      StShowUI: 4,
      StProcessUI: 5,
      StException: 800,
      StFinished: 999
    },

    //
    // This is the state machine for doing download MULTIPLE script, posting
    // progress dialog, cache script, etc.  this is a replacement for
    // loadDataScript() / downloadAndCacheScript()
    //
    SBgDlProcessState : function()
    {
      var sm = updater.gStateMachine;

      try {
        var state = sm.state;
        var st_enum = sm.enumStates;
        
        //updater.console.println("= SBgDlProcessState =");
        //updater.MasterScript.DumpObject(sm.idleArgs, "idleArgs", true);

        // unpackage the args
        var loadScriptArgs = sm.idleArgs.loadScriptArgs;
        updater.MasterScript.assert(loadScriptArgs.constructor == Array, "loadScriptArgs not an Array!");

        // init idx
        if (! updater.MasterScript.PropertyIsDefined(sm, "scriptArgIdx") ) {
          sm.scriptArgIdx = 0;
          }

        // updater.console.println("scriptArgIdx = " + sm.scriptArgIdx);
        // updater.MasterScript.DumpArray(loadScriptArgs);

        var lsArgs = loadScriptArgs[sm.scriptArgIdx];
        
        // cannot check assert here since lsArgs MAYBE null for the last
        // element before proceeding to the StFinished state
        //updater.MasterScript.assert(lsArgs, "lsArgs is NULL");
        // updater.MasterScript.DumpObject(lsArgs, "lsArgs", true);

        var scriptURL = lsArgs? lsArgs["scriptURL"] : null;
        var serializationRoot = lsArgs ? lsArgs["serializationRoot"] : null;
        var scriptCacheName = lsArgs ? lsArgs["scriptCacheName"] : null;
        var callPoint = lsArgs ? lsArgs["callPoint"] : null;
        var dontMount = lsArgs ? lsArgs["dontMount"] : null;

        var suppressUI = sm.idleArgs["suppressUI"];
        var closeUI = sm.idleArgs["closeUI"];
 
        switch (state) {
          case st_enum.StInit : 
            try {
              updater.console.println("=== StInit ===");
              if (! scriptURL || scriptURL.length <=0 ) { 
                sm.exception =  "InvalidScriptURL"; 
                sm.state = sm.StException;
                break;
                }
              updater.console.println("  url = " + scriptURL);
              // setup private var in sm
              sm.cachedScriptObj = null;
              sm.cachedScriptObj = updater.MasterScript.GetCachedScriptObj(serializationRoot, scriptCacheName);
              
              sm.cachedScriptModDate = null;
              sm.cachedScriptModDate = updater.MasterScript.GetCachedScriptModDate(sm.cachedScriptObj);
              
              sm.state = sm.enumStates.StShowUI;
              }
            catch (e) {
              updater.console.println("Exception in StInit: " + e);
              sm.exception = e;
              sm.state = sm.StException;
              }
            break;

        case st_enum.StShowUI:
          try {
            updater.console.println("=== StShowUI ===");
            if (!suppressUI) {
              updater.app.showProgressDialog();
              }
            sm.uiCancelled = false;
            sm.state = sm.enumStates.StReadStart;
            }
          catch (e) {
              updater.console.println("Exception in StShowUI: " + e);
              sm.exception = e;
              sm.state = sm.StException;
            }
          break;
          
        case st_enum.StReadStart :
          try {
            updater.console.println("=== StReadStart ===");
            sm.response = null;

            if (sm.cachedScriptModDate) {
              updater.console.println(" calls updater.net.urlGetAsync() using if-mod-since");
              sm.urlMon = updater.net.urlGetAsync(scriptURL, sm.cachedScriptModDate.toUTCString());
              }
            else {
              updater.console.println(" calls updater.net.urlGetAsync()");
              sm.urlMon = updater.net.urlGetAsync(scriptURL);
              }
            sm.state = sm.enumStates.StProcessUI;
            }
          catch (e) {
            updater.console.println("Exception in StReadStart" + e);
            sm.exception = "URLGetException";
            sm.state = sm.enumStates.StException;
            }
          break;

        case st_enum.StProcessUI :
          try {
            updater.console.println("=== StProcessUI ===");
            // updater.app.processDialogEvent();
            sm.state = sm.enumStates.StUIWait; 
            }
          catch (e) {
              updater.console.println("Exception in StPocessUI: " + e);
              sm.exception = e;
              sm.state = sm.StException;            
            }
          break;

        case st_enum.StUIWait :
          try {
            updater.console.println("=== StUIWait ===");
            sm.uiCancelled = updater.app.isProgressDialogCancelled()
            sm.state = sm.enumStates.StReadWait; 
            }
          catch (e) {
              updater.console.println("Exception in StUIWait: " + e);
              sm.exception = e;
              sm.state = sm.StException;            
            }
          break;
              
        case st_enum.StReadWait :
          try {
            updater.console.println("=== StReadWait ===");

            if (sm.uiCancelled) {
              sm.urlMon.cancel();
              sm.exception = "DownloadCancelled";
              sm.state = sm.enumStates.StException;
              break;
              }

            if (sm.urlMon.done) {
              sm.state = st_enum.StReadDone;
              break;
              }

            sm.urlMon.wait();

            sm.state = st_enum.StProcessUI;
            }
          catch (e) {
            updater.console.println("Exception in StReadWait" + e);
            sm.exception = e;
            sm.state = sm.enumStates.StException;
            }
          break;

        case st_enum.StReadDone:
          try {
            updater.console.println("=== StReadDone ===");

            // should check again if ui is cancelled due to late click
            // latching
            if (updater.app.isProgressDialogCancelled()) {
              sm.exception = "DownloadCancelled";
              sm.state = sm.enumStates.StException;
              break;
              }

            if (! updater.MasterScript.PropertyIsDefined(sm, "scriptObjs")
                || (sm.scriptObjs.constructor != Array) ) {
              sm.scriptObjs = new Array();
              }

            var idx = sm.scriptArgIdx;

            // acrobat can raise in urlMon.response if the download scripts
            // not signed correctly
            sm.scriptObjs[idx] = 
                updater.MasterScript.GetAndCacheScriptObjFromResp(sm.cachedScriptObj, 
                   sm.urlMon.response, serializationRoot, scriptCacheName);

            // mount call point
            if (!dontMount) {
              updater[callPoint] = sm.scriptObjs[idx];
              }

            // initialize script obj
            if (updater.MasterScript.PropertyIsDefined(updater[callPoint], 
                                                       "Initialize")
                &&
                updater[callPoint]["Initialize"].constructor == Function) {
              updater[callPoint]["Initialize"]();
              }

            // done when all script in loadScriptArgs is iterated 
            sm.scriptArgIdx++;
            if (sm.scriptArgIdx < loadScriptArgs.length) {
              sm.state = st_enum.StInit;
            }
            else {
              if (closeUI) {
                updater.app.hideProgressDialog();
                }
              sm.state = st_enum.StFinished;
              }
            }
          catch (e) {
            updater.console.println("Exception in StReadDone : " + e);
            sm.exception = e;
            sm.state = sm.enumStates.StException;
            }
          break;

        case st_enum.StException:
          updater.console.println("=== StException ===");
          // always closes UI when exception happens
          updater.app.hideProgressDialog();

          var e = sm.exception;
          updater.console.println("Exception in " + sm.name + ": " + e);

          if (e == "URLGetException" || e == "URLContentNotFound" || e == "ServerError") {
            // These errors are probably network or server related.  don't
            // even need to bother user with the error.  just inform them no
            // update is available at this time
            var title = updater.app.getUpdaterString("uisJSNoUpdtAvailTitle");
            var errMsg = updater.app.getUpdaterString("uisJSNoUpdtAvailAtThisTimeText");

            if (! suppressUI) 
              updater.app.alert({nIcon:3, nType:0, cTitle:title, cMsg:errMsg});
            }
          else if (e == "NoDateHeader" || e == "BadData") {
            // probably should not pop dialog here since these are internal
            // errors from downloadAndCacheScript
            var title = updater.app.getUpdaterString("bsJSNoNetConnectTitle");
            var errMsg = updater.app.getUpdaterString("bsJSInternalErrorText");
            
            if (! suppressUI)
              updater.app.alert({nIcon:0, nType:0, cTitle:title, cMsg:errMsg});
            }
          else if (e == "DownloadCancelled" ) {
            updater.MasterScript.assert(false, "DownloadCancelled");
            updater.console.println("DownloadCancelled");
            // siliently swollow the exception if user cancelled out
            }

          sm.exception = "LoadScriptException";
          sm.state = st_enum.StFinished;
          break;

        case st_enum.StFinished:
          try {
            updater.console.println("=== StFinished ===");
            
            // should check again if ui is cancelled due to late click
            // latching
            if (!sm.uiCancelled && updater.app.isProgressDialogCancelled()) {
              updater.MasterScript.assert(false, "DownloadCancelled");
              updater.console.println("DownloadCancelled");
              sm.exception = "LoadScriptException";
              sm.state = sm.enumStates.StException;
              }

            updater.app.clearInterval(sm.handle);
            sm.done = true;
            updater.gStateMachineLock = false;
          
            // call resume proc when done
            updater.MasterScript.assert(sm.resumeProc.constructor == Function, "resumeProc NOT a function");
            if (sm.resumeProc.constructor == Function) {
              sm.resumeProc(sm);
              }
            else {
              updater.console.println("sm.resumeProc not a function.  skip calling");
              }
            }
          catch (e) {
            updater.console.println("Exception in StFinished" + e);
            // close the UI 
            updater.app.hideProgressDialog();
            }
          break;
          
        default :
          updater.MasterScript.assert(false, "Shoule NOT reach default case - " + sm.name);
          throw "CannotHappen";
          break;
          }
        }
      catch (e) {
        sm.exception = e;

        updater.app.clearInterval(sm.handle);
        sm.done = true;
        updater.gStateMachineLock = false;

        updater.console.println("Exception in SBgDlProcessState: " + e);
      }
    },

    // 
    // Updater Script loading machinism
    // 
    // MasterScript: assumed always available (from bootstrap.js).  it
    // exports common functions and system functions to all other scripts.
    // It ONLY knows how to load DataScript.js.  Once DataScript is loaded,
    // MasterScript inquires DataScript about what other scripts DataScript
    // needs by calling DataScript.GetScriptDependencyList() and load all the
    // required scripts.  After each script is loaded, its Initialize()
    // function will be called if exists.
    //
    // DataScript: loaded only by MasterScript.  It has three piece of
    // information:
    //
    // 1) the available component data structure.  it contains all available
    // component for a given acrobat product configuration.
    //
    // 2) messages to be shown by the notification dialog
    //
    // 3) A function that returns a script depency list.  This allow future
    // expandability.  it initially contains only CodeScript and UIScript.
    //
    // DataScript Initialize() will have to check if the system has correct
    // version of MasterScript.  If not, it would call
    // LoadAndCacheScriptAsync() to get a new MasterScript.  A viewer restart
    // is required if new MasterScript is loaded.
    // 
    // CodeScript: Contains all procedures for doing Auto Update, Manual
    // Update, FincComponent, etc.
    //
    // UIScript: Contains all UI elements for Updater.
    //
    // Since MasterScript knows only DataScript, call-chaining is used so
    // that arbitrary scripts (potentially new scripts) can be used to
    // implement/replace Updater's functionality.  It works like this:
    // 
    // DataScript and the script contains the implementation of Updater's
    // functionality contains a common entry point, aptly named entryPoint().
    // it is called with an {} with "func", and "args" memebers.  DataScript
    // has the right to vector off the requests to the implementation script
    // (CodeScript) by simply calling entryPoint() with pass the arg along.
    // MasterScript.AutoUpdate() --> DataScript.entryPoint(arg)
    // --> CodeScript.entryPoint(arg) --> CodeScript.AutoUpdate(udArgs)
    // where arg is {func:AutoUpdate, arg:{udArgs}}
    // udArags is an {}
    //
    
    
    //
    // this is a non blocking call.  if suppressUI is true, no UI is shown by
    // default, the UI is not closed when operation is done unless closeUI is
    // true.  UI is always closed when exception happens
    //
    // loadScriptArgs is an array of elements:
    // {
    //   "scriptURL" : this.getDSURL(),
    //   "serializationRoot" : updater.store.perUser,
    //   "scriptCacheName" : "cachedDataScript",
    //   "callPoint" : "DataScript"
    //   "temp" : false
    // }
    //
    LoadAndCacheScriptAsync: function(loadScriptArgs,
                                      resumeProc, resumeArgs,
                                      suppressUI, closeUI)
    {
      var idleProc =  "updater.MasterScript.SBgDlProcessState()";
      
      var idleArgs = { "loadScriptArgs" : loadScriptArgs,
                       "suppressUI" : suppressUI,
                       "closeUI" : closeUI };
                      
      this.SStartStateMachine(idleProc, idleArgs,
                              resumeProc, resumeArgs, 
                              "SBgDlProcessState", this.SBgDlStates);
      return this.SStartStateMachine;
    },

    LoadScriptDepFinishProc: function(sm)
    {
      try {
        updater.console.println("LoadScriptDepFinishProc()"); 
        // something wrong in state machine, raise it
        if (sm.exception) { throw sm.exception };

        updater.MasterScript.assert(sm.resumeArgs["dsCallerResumeProc"], "dsCallerResumeProc undefined! ");
        
        updater.app.hideProgressDialog();

        var func = sm.resumeArgs["dsCallerResumeProc"];
        var args = sm.resumeArgs["dsCallerResumeArgs"];
        if (func.constructor == Function) {
          func(args);
          }
        }
      catch (e) {
        updater.console.println("Exception in LoadScriptDepFinishProc: " + e);
        }
    },

    LoadDataScriptFinishProc: function(sm)
    {
      try {
        updater.console.println("LoadDataScriptFinishProc()"); 

        // something wrong in state machine, raise it
        if (sm.exception) { throw sm.exception };

        var depScriptsArgs = updater.DataScript.GetScriptDependency();

        // updater.MasterScript.DumpObject(depScriptsArgs,"depScriptsArgs", true);

        updater.MasterScript.assert(depScriptsArgs.constructor == Array);

        var suppressUI = sm.resumeArgs["dsCallerSuppressUI"];
        var closeUI = sm.resumeArgs["dsCallerCloseUI"];

        updater.MasterScript.LoadAndCacheScriptAsync(depScriptsArgs, 
                                                     updater.MasterScript.LoadScriptDepFinishProc,
                                                     sm.resumeArgs,
                                                     suppressUI, closeUI);
        }
      catch (e) {
        updater.console.println("Exception in LoadDataScriptFinishProc: " + e);
        }
    },
    
    LoadDataScriptAsync: function(resumeProc, resumeArgs, 
                                  suppressUI, closeUI)
    {
      var loadScriptArgs = new Array();

      var dsLoadArgs = {
        "scriptURL" : this.getDSURL(),
        "serializationRoot" : updater.store.perUser,
        "scriptCacheName" : "cachedDataScript",
        "callPoint" : "DataScript"
        };
      
      loadScriptArgs[0] = dsLoadArgs;
      
      var dsFinishArg = {"dsCallerResumeProc": resumeProc,
                         "dsCallerResumeArgs" : resumeArgs,
                         "dsCallerSuppressUI" : suppressUI,
                         "dsCallerCloseUI" : closeUI};

      // before running resumeProc and resumeArgs, will call
      // LoadDataScriptFinishProc it load up all scripts DataScript requires
      this.LoadAndCacheScriptAsync(loadScriptArgs,
                                   this.LoadDataScriptFinishProc, dsFinishArg,
                                   suppressUI, closeUI);
    },


    //
    // Manual Update Procs
    //
    // this is called when DataScript.entryPoint() is done
    ManualUpdateCallBackProc: function(args)
    {
      try {
        updater.MasterScript.saveState();  // can raise 
      }
      catch (e) {
        updater.console.println("Exception in ManualUpdateCallBackProc: " + e);
      }
    },

    // this is called when DataScript has been downloaded
    ManualUpdateFinishProc: function(args)
    {
      // call datascript main entry point
      try {
        updater.console.println("ManualUpdateFinishProc()"); 

        args.callBack = updater.MasterScript.ManualUpdateCallBackProc;
        args.callBackArgs = null;
        updater.DataScript.entryPoint(args);
      }
      catch (e) {
        updater.console.println("Exception in ManualUpdateFinishProc: " + e);
      }
    },

    ManualUpdateAsync: function()
    {
      try {
        updater.console.println("ManualUpdateAsync()"); 
        if ( ! this.init(false) ) return;

        this.loadState();

        updater.isAutoUpdate = false;
        updater.useSyncRead = false;
        var finishProcArgs = {func:"doUpdate", 
                              args:{isAutoUpdate:false}};
        this.LoadDataScriptAsync(this.ManualUpdateFinishProc, finishProcArgs);
        }
      catch (e) {
          updater.console.println("Exception in ManualUpdateAsync: " + e);
          return false;
      }
    },


    //
    // AutoUpdate and Check DLM Procs
    // 

    // this is called when DataScript.entryPoint() is done
    AutoUpdateCallBackProc: function(args)
    {
      try {
        updater.MasterScript.advanceNextCheckDate();
        updater.MasterScript.popNotifications();
        updater.MasterScript.saveState();  // can raise 
      }
      catch (e) {
        updater.console.println("Exception in AutoUpdateCallBackProc: " + e);
      }
    },

    // this is called when DataScript has been downloaded
    AutoUpdateFinishProc: function(args)
    {
      // call datascript main entry point
      try {
        updater.console.println("AutoUpdateFinishProc()"); 

        args.callBack = updater.MasterScript.AutoUpdateCallBackProc;
        args.callBackArgs = null;
        updater.DataScript.entryPoint(args);
      }
      catch (e) {
        updater.console.println("Exception in AutoUpdateFinishProc: " + e);
      }
    },


    CheckDLMStateFinishProc: function(args)
    {
      // call datascript main entry point
      try {
        updater.console.println("CheckDLMStateFinishProc()");

        updater.DataScript.entryPoint(args);
        }
      catch (e) {
        updater.console.println("Exception in CheckDLMStateFinishProc: " + e);
        }
    },

    AutoUpdateAsync: function()
    {
      try {
        updater.console.println("AutoUpdateAsync()"); 

        if ( ! this.init(true) ) return;

        // do a quick check before using CodeScript's CheckDLMState() which
        // has dialogs.
        var dlmState = updater.dlm.getState();
        updater.console.println("  updater.dlm.getState() returns " + dlmState);
        // DLM not running.  rdy to accept transaction
        // quickly return
        if (dlmState != 0) { 
          // DLM has pending stuff
          // ok.  now we must do some UI since there are pending updates
          // calls into CodeScript's CheckDLMState()
          
          if (! updater.MasterScript.checkNetConnection(true) ) {
            // if no net, try if all scripts are cached already.
            var hasAllScripts = updater.MasterScript.getAllScriptsFromStore();
            if (hasAllScripts) {
              updater.DataScript.entryPoint({func:"CheckDLMState", args:{}}); 
              }
            }
          else {
            // has net connection
            var finishProcArgs = {func:"CheckDLMState", 
                                  args:{}};
            this.LoadDataScriptAsync(this.CheckDLMStateFinishProc, finishProcArgs, true);
            }
          return;
          }
        else {
          // continue AutoUpdate
          this.loadState();

          // check if pref is set the monthly
          // monthly: 1
          // manually: 0
          var freq = updater.app.getUpdateFrequency();
          updater.console.println("  freq = " + freq);

          // do auto update when it is time to AND freq is monthly
          if ( (freq == 1) &&  this.isTimeToUpdate() ) {
            // silently returns if autoupdate and no net
            if (! updater.MasterScript.checkNetConnection(true) ) {
              return false;
              }
            
            updater.isAutoUpdate = true;
            updater.useSyncRead = true;
            
            var finishProcArgs = {func:"doUpdate", 
                                  args:{isAutoUpdate:true}};
            this.LoadDataScriptAsync(this.AutoUpdateFinishProc, finishProcArgs, true);
            }
          else {
            // pop new notifications. calls only finish auto-update check, not
            // manual check
            this.popNotifications();
            this.saveState();  // can raise
            }
          }
        }
      catch (e) {
        updater.console.println("Exception in AutoUpdateAsync: " + e);
        return false;
        }
    },


    //
    // FindComponent Procs
    // 
    // this is called when DataScript.entryPoint() is done
    FindComponentCallBackProc: function(args)
    {
      try {
        var ret = args["returnVal"];
        updater.console.println("ComponentFound = " + ret); 
        updater.MasterScript.saveState();  // can raise 
      }
      catch (e) {
        updater.console.println("Exception in FindComponentCallBackProc: " + e);
      }
    },

    // this is called when DataScript has been downloaded
    FindComponentFinishProc: function(args)
    {
      // call datascript main entry point
      try {
        updater.console.println("FindComponentFinishProc()"); 

        args.callBack = updater.MasterScript.FindComponentCallBackProc;
        args.callBackArgs = null;
        updater.DataScript.entryPoint(args);
      }
      catch (e) {
        updater.console.println("Exception in FindComponentFinishProc: " + e);
      }
    },

    FindComponentAsync: function(type, name, desc, ver, params)
    {
      try {
        updater.console.println("FindComponentAsync()"); 

        if ( ! this.init() ) return;

        this.loadState();

        var hasNet = updater.net.isConnected();
        var wellKnown = false;

        if ( !desc || desc.length == 0 ) {
          // no desc given by caller.  try lookup well known component
          // description
          var knownDesc = this.lookUpWellKnownCompDesc(type, name);
          if (knownDesc && knownDesc.length > 0) {
            wellKnown = true;
            desc = knownDesc;
            }
          else {
            wellKnown = false;
            desc = type + "/" + name;
            if (ver) desc = desc + ":" + ver;
            }
          }

        updater.console.println("  wellKnown = " + wellKnown);
        updater.console.println("  desc      = " + desc);
        // if no net, prompt user if connecting to net is ok
        if (! hasNet) {
          var cont;
          if (wellKnown) {
            cont = this.showMissingCompDialog(desc);
            }
          else {
            cont = this.showMissingCompDialog();
            }
          // no = 3,  yes =4
          if (cont == 3) return false;
          }
        
        // user wants to continue.  forward request to CodeScript via DataScript
        // download the datascript (may need to connect to net)


        var finishProcArgs = {func:"findComponent", 
                              args:{type:type, name:name, desc:desc, ver:ver, params:params}};
        this.LoadDataScriptAsync(this.FindComponentFinishProc, finishProcArgs);
        return true;
        }
      catch (e) {
          updater.console.println("Exception in FindComponentAsync: " + e);
          return false;
      }
    },



    __ENDER__:"END"
};

ScriptObj;
//
// StartUp.js
// 
// Edit History:
// Danny Siu: Fri Apr 18 01:35:10 2003
// End History
//
// [SHOULD REMOVE ALL THE COMMENTS FROM PRODUCTION!!!]
// 
// the sole purpose of bootstrap script is to load up the masterscript and
// make sure it exists in Updater JS runtime (ie: defines
// updater.MasterScript).  it must also define a updater.scriptRootURL which
// can be used to defer the location of MasterScript on the server.
//
// during developement, the MasterScript is always loaded from a server by
// doing urlGet().  For release, there should be a presisted MasterScript in
// user's dir and the bootstrap script should load up the presist file and
// bring the cached MasterScript back to life.
//
// 2002-12-11 Updates: 
// 
// Here is how MasterScript would be loaded up: 
// 
// 1) First check if an presisted version in updater.store is available.  If
// so, check its version againt updater.MasterScript( if it is even defined
// in the runtime probably because of bootstrap.js evaluation)
//
// Then set updater.MasterScript to the newer version.  This allow us to
// update and override MasterScript later on.
//
// 2) if NOT, use darn simple urlGet() to fetch it from
// updater.masterScriptURL the newly fetched script will be presisted so that
// it doesn't need to be refetch next time
// 
//
// updater.bootStrapped is a globle which C++ code can check if bootstrapping
// has happened.  it is for optimization so that bootstrip.js will only be
// opened and eval'ed once per app launch.
//
// updater.scriptRootURL is the base of where all scripts will live on server
//

// The stable set of scripts updated once or twice a week for QE and Dev
// This is the default location for Updater scripts within Adobe
// updater.scriptRootURL = "http://mcmug.corp.adobe.com/~dsiu/NewportUpdater/js/";

// Lastest and greatest scripts for development and limited QE testing
// Uncomment the following line if you want to try the latest scripts
// updater.scriptRootURL = "http://mcmug.corp.adobe.com/~dsiu/NewportUpdater/js_dev/";

// For my own development using local web server
// do not uncomment the following unless you know what you are doing 
// updater.scriptRootURL = "http://127.0.0.1/NewportUpdater/js/";

// For Beta3 deployment
updater.scriptRootURL = "http://update.adobe.com/pub/adobe/acrobat/js/6.x/";

// updater.bootStrapped = false;


if (! updater.bootStrapped) {

  try {
    updater.console.println("===== Loading bootstrap.js =====");

    // Since MasterScript WILL be prepended this file to form bootstrap.js, need
    // to check if ScriptObj exists and and pick it up as MasterScript
    if (typeof(ScriptObj) != "undefined") {
      updater.console.println("  picked up default MasterScript from bootstrap.js");
      updater.MasterScript = ScriptObj;
    }

    // overrideable scriptRootURL by Pref
    // updater.avpref can raise if the pref section/key not defined
    try {
      updater.scriptRootURL = updater.avpref.get("Updater", 
                                                 "ScriptRootURL", 
                                                 updater.avpref.type["String"], 
                                                 updater.scriptRootURL);
      updater.console.println("  overriding scriptRootURL from pref");
    } catch (e) {}  // safely ignore the raise by avpref 

    updater.console.println("  updater.scriptRootURL = " + updater.scriptRootURL);

    // first check if there is a presisted version (the following code has
    // CANNOT assume existence of MasterScripts and its friends of utilities
    // functions)

    try {
      updater.store.load();
      }
    catch (e) {
      updater.console.println("Exception in trying to do updater.store.load(): " + e);
      updater.console.println("  --> skip loading store");
      }

    var cachedMSVersion;
    var cachedMSName = "cachedMasterScript";
    cachedMSName = cachedMSName + "_" + updater.app.viewerType + "_" + updater.app.language;
    var curRunTimeMSVersion;

    var gotMasterScript = false;

    
    // version checking 

    // finding out cached MasterScript version
    if ( typeof(updater.store.perUser[cachedMSName]) != "undefined" &&
         typeof(updater.store.perUser[cachedMSName]["scriptObj"]) != "undefined" )
      {
      cachedMSVersion = updater.store.perUser[cachedMSName].scriptObj.version + 0.0;
      updater.console.println(" checking cachedMSVersion = " + cachedMSVersion);
      }
    else {
      cachedMSVersion = 0.0;
      }

    // finding out current MasterScript version
    if ( (typeof(updater["MasterScript"]) != "undefined" ) &&
         (typeof(updater.MasterScript["version"]) != "undefined") ) 
      {
      curRunTimeMSVersion = updater.MasterScript.version + 0.0;
      updater.console.println(" checking curRunTimeMSVersion = " + curRunTimeMSVersion);
      }
    else {
      curRunTimeMSVersion = 0.0;
      }

    if ( (curRunTimeMSVersion != 0) && (curRunTimeMSVersion > cachedMSVersion) ) {
      updater.console.println("--> Using MasterScript from current runtime.  version = " + curRunTimeMSVersion);
      gotMasterScript = true;
      }

    // MUST use >= to compare cached verion with the current one in runtime
    // since current one in runtime may well be the cached one when bootstrip
    // is eval the second time
    if ( !gotMasterScript &&
         (cachedMSVersion != 0) && (cachedMSVersion >= curRunTimeMSVersion) ) {
      updater.MasterScript = updater.store.perUser[cachedMSName].scriptObj;
      updater.console.println("--> Using MasterScript from cache.  version = " + cachedMSVersion);
      gotMasterScript = true;
      }

    if (!gotMasterScript) {
      // no existing MasterScript....do a urlGet();
      // first check if there is net connection
      var hasNet; 
      if ( typeof(updater.net["isConnected"]) != "undefined") {
        hasNet = updater.net.isConnected();
        }
      else {
        hasNet = updater.dlm.hasNetAccess();
        }
      
      if (! hasNet) {
        // should use UIScript's showErrorDialog() when UIScript is presisted.
        // for now just do app.alert.
        var title = updater.app.getUpdaterString("bsJSNoNetConnectTitle");
        var errMsg = updater.app.getUpdaterString("bsJSNoNetConnectText");
        updater.app.alert({nIcon:0, nType:0, cTitle:title, cMsg:errMsg});
        }
      else {
        updater.console.println("  fetching MasterScript with urlGet()");

        // should add prod config into creating the URL later
        var masterScriptURL = updater.scriptRootURL + "MasterScript.js";

        var resp = updater.net.urlGet(masterScriptURL);

        updater.console.println("  eval MasterScript");
		var newScriptObj = eval( resp.Content );
        updater.console.println("  eval MasterScript doone");
		if ( newScriptObj == null ) {
          updater.console.println("  something wrong while eval resp.Content.  throws!");
          throw "badData";
          }
        updater.MasterScript = newScriptObj;
        
        updater.console.println("  saving MasterScript");
        // can null be used for cachedDate?
        updater.store.perUser[cachedMSName] = { cachedDate : null,
                                                scriptObj : newScriptObj };

        // save user store
        try {
          updater.store.save();
          }
        catch (e) {
          updater.console.println("Exception in trying to updater.store.save(): " + e);
          throw new Error("SaveStateException");
          }
        
        gotMasterScript = true;
        }
      }

    updater.bootStrapped = gotMasterScript;

//     if (gotMasterScript &&
//         typeof(updater.MasterScript["InstallPrefPanel"] != "undefined") ) {
//       updater.console.println("  installing PrefPanel");
//       updater.MasterScript.InstallPrefPanel();
//       }

    updater.console.println("===== bootstrap.js done =====");
    }
  catch (e) {
    updater.console.println("  Exception during bootstrap - " + e);
    }
}
else {
  updater.console.println("===== bootstrap.js already loaded =====");
}


