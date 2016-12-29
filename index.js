/**
*Copyright 2016 Rebecca Onuschak, except as noted below.   This code may be implemented, with or without modification, for personal use, provided this copyright remains intact, but no other commercial or noncommercial license or rights are conveyed with this offer.  Use of this Alexa skill, when obtained via the Amazon Alexa platform as a published skill, will be licensed in accordance with Amazon standard terms.
*/

/**
* A portion of this code was adapted from Amazon code samples, and this relies on an a modified version of the Alexa.js file provided by Amazon.  The copyright statement above is for the overall GMail skill concept and for the coding work done to enable it.  This does not alter in any way Amazon license terms for its portions of the code, or any rights that may be claimed by Google for use of its services and trademark names.  The following statement was included by Amazon in its files:
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the 

License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR 

CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and 

limitations under the License.
*/

'use strict';
var APP_ID = process.env.appID;wel

//SETUP REFERENCES - The AlexaSkill prototype and https helper function

var AlexaSkill = require('./AlexaSkill');
var https = require('https');

var MyGmail = function () {
    AlexaSkill.call(this, APP_ID);
};

// EXTEND AlexaSkill
MyGmail.prototype = Object.create(AlexaSkill.prototype);
MyGmail.prototype.constructor = MyGmail;

MyGmail.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    //erase google drive files from old sessions (any images from "show me").
    var myToken=session.user.accessToken;
    var postData = "{'function':'deleteFiles','parameters':['"+myToken+"']}";
    runScripts (postData, session, function scriptCallback(err,scriptResponse){
    });
};    

//if no intent was stated, then default to the review intent

MyGmail.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    if(!session.user.accessToken){
	makeResponse(session,response,2);
    } else{
	var intent={
      "name": "ReviewIntent",
      "slots": {
        "fromFilter": {
          "name": "fromFilter"
        },
        "subjectFilter": {
          "name": "subjectFilter"
        },
        "readFilter": {
          "name": "readFilter",
          "value": "new"
        },
        "dateFilter": {
          "name": "dateFilter"
        }
      }
	};
	checkpin (intent,session, response);}
};

MyGmail.prototype.eventHandlers.onSessionEnded = function (SessionEndedRequest, session) {

};

//CONNECT INTENTS TO THE FUNCTIONS THAT WILL HANDLE THEM

MyGmail.prototype.intentHandlers = {
   "CountIntent": function (intent, session, response) {
       checkpin(intent, session,response);
    },
    "ReviewIntent": function (intent, session, response) {
        checkpin(intent, session,response);
    },
    "AMAZON.NextIntent": function (intent, session, response) {
        checkpin(intent, session,response);
    },
    "AMAZON.PreviousIntent": function (intent, session, response) {
 	    checkpin(intent, session,response);
    },
    "GoToMessageIntent": function (intent, session, response) {
 	    checkpin(intent, session,response);
    },
    "DetailsIntent": function (intent, session, response) {
        checkpin(intent, session,response);
    },
    "MarkReadIntent": function (intent, session, response) {
 	    checkpin(intent, session,response);
    },
    "MarkUnReadIntent": function (intent, session, response) {
     	checkpin(intent, session,response);
    },
    "StarIntent": function (intent, session, response) {
 	    checkpin(intent, session,response);
    },
    "UnStarIntent": function (intent, session, response) {
     	checkpin(intent, session,response);
    },
    "DeleteIntent": function (intent, session, response) {
        checkpin(intent, session,response);
    },
    "RefreshIntent": function (intent, session, response) {
        checkpin(intent, session,response);
    },
    "ReplyIntent": function (intent, session, response) {
        checkpin(intent, session,response);
    },
    "ReplyAllIntent": function (intent, session, response) {
        checkpin(intent, session,response);
    },
    "PrintMessageIntent": function (intent, session, response) {
        checkpin(intent, session,response);
    },
    "SetPrinterIntent": function (intent, session, response) {
        checkpin(intent, session,response);
    },
    "ListAttachmentsIntent": function (intent, session, response) {
        checkpin(intent, session,response);
    },
    "PrintAttachmentsIntent": function (intent, session, response) {
        checkpin(intent, session,response);
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        helpTheUser(intent, session, response);
    },
    "AMAZON.StopIntent": function (intent, session, response) {
	    makeResponse(session,response,28);
    },
    "AMAZON.CancelIntent": function (intent, session, response) {
        makeResponse(session,response,28);
    },
   "AMAZON.RepeatIntent": function (intent, session, response) {
 	    makeResponse(session, response,29);
    },
    "AMAZON.YesIntent": function (intent, session, response) {
 	    questionYesHandler(intent, session, response);
    },
    "AMAZON.NoIntent": function (intent, session, response) {
 	    questionNoHandler(intent, session, response);
    },
    "ShowMeIntent": function (intent, session, response) {
 	    checkpin(intent, session,response);
    },   
    "AMAZON.StartOverIntent": function (intent, session, response) {
     	checkpin(intent, session, response);
    },
    "HelpWithSlotIntent": function (intent, session, response) {
 	    helpTheUser(intent, session, response);
    },
    "SetPINIntent": function (intent, session, response) {
        checkpin(intent,session,response);
    },
    "SayPINIntent": function (intent, session, response) {
        checkpin(intent,session,response);
    },
    "ClearPINIntent": function (intent, session, response) {
        checkpin(intent,session,response);
    },
    "AdvancedModeOnIntent": function (intent, session, response) {
	    session.attributes.advanced=true;
        checkpin(intent,session,response);
    },
    "AdvancedModeOffIntent": function (intent, session, response) {
		session.attributes.advanced=false;
        checkpin(intent,session,response);
    },
    "WaitIntent":function (intent, session, response) {
        checkpin(intent,session,response);
    }
};


//User has asked how many messages match certain criteria (or how many on the current list)
function getCount (intent, session, response) {
//initialize session attributes and some needed variables.
	session.attributes.lastIntent="";
	var myFilter; //will hold value for label (new,old,all,starred) on messages to search.
    var searchString=""; //will hold the rest of the search parameters, if any.
    var query="&q=in:inbox"; //holds the query string in gMail API format;
    var useExistingList=false;
    var myPath = "/gmail/v1/users/me/messages";
    
//check for filters on the intent:
    var readSlot=intent.slots.readFilter.value;
    var dateSlot=intent.slots.dateFilter.value;
    //if no previous filter was saved in session attributes and no search is requested now, default to new messages:
    if(!readSlot&&!session.attributes.readFilter&&!session.attributes.searchString)
    {
        if(!intent.slots.fromFilter.value&&!intent.slots.subjectFilter.value&&!dateSlot){myFilter=' new';}
        else {myFilter="";}
    }
    //if the user only asked how many messages do I have while already working a list, assume the same list)
    //assume they are asking about the same list they are working with: 
    else {
		    if(!readSlot&&!intent.slots.subjectFilter.value&&!intent.slots.fromFilter.value&&!dateSlot){
		        useExistingList=true;
		    } 
	    }
    //if something is in the intent slot, standardize the word choices the user had:
    if(readSlot){
	        if(readSlot.match('read')||readSlot.match('old')){myFilter=' old';}       
	        if(readSlot.match('unread')||readSlot.match('new')){myFilter=' new';}
	        if(readSlot=='all'||readSlot=='total'){myFilter=' total';}
	        if(readSlot.match('starred')||readSlot.match('important')){myFilter=' starred';}    
        }
    if(!myFilter){myFilter="";}
    //handle the date, recorded by Alexa as P[yY][mM][dD][T[hH][mM][s[.s]S]] where lower case is a number. we will convert it all //to days for ease of searching gmail, and will throw errors for anything lower than that.
    if(dateSlot){
		    searchString = " sent in the last";
		    var daycounter=0;
		    var lastItem;
		    var errFlag;
		    var testItem;
		    for (var indexer = 0; indexer < dateSlot.length; indexer++) 
		    {
		        testItem = dateSlot.substr(indexer,1);
        		if(isNaN(testItem))
		        {
        			switch(testItem)
            			{
				case 'P':
					break;
				case 'Y':
					if(lastItem == 1){searchString=searchString+" year";}
					else{searchString=searchString+" "+lastItem+" years";}
					daycounter=daycounter+lastItem*365;
					break;	
				case 'M':
					if(lastItem == 1){searchString=searchString+" month";}
					else{searchString=searchString+" "+lastItem+" months";}
					daycounter=daycounter+lastItem*30;
					break;
				case 'W':
					if(lastItem == 1){searchString=searchString+" week";}
					else{searchString=searchString+" "+lastItem+" weeks";}
					daycounter=daycounter+lastItem*7;
					break;
				case 'D':
					if(lastItem == 1){searchString=searchString+" day";}
					else{searchString=searchString+" "+lastItem+" days";}
					daycounter=daycounter+lastItem;
					break;
				case 'H':
					errFlag=true;
					break;
				case 'T': 
					errFlag=true;
					break;
				default:
					errFlag=true;
				}
			        lastItem=testItem;
        		} else
		            {
			if(isNaN(lastItem)){lastItem=testItem;}
			else{lastItem = parseInt(lastItem.toString()+testItem.toString());}
		}
		        if(errFlag)
        			{
				session.attributes.helpContext=2;
				session.attributes.tmpreadFilter="";
				session.attributes.tmpsearchString="";
				session.attributes.tmpmessageList="";
				makeResponse(session,response,1);
			}
		    }
	        query = query+"%20newer_than:"+daycounter+"d";
	    }
    //get the rest of the search parameters
    if(intent.slots.fromFilter.value){
	        searchString=searchString+" from "+intent.slots.fromFilter.value;
	        query = query+"%20from:"+intent.slots.fromFilter.value;
	    }
    if(intent.slots.subjectFilter.value){
	        searchString=searchString+" about "+intent.slots.subjectFilter.value;
	        query = query +"%20subject:"+intent.slots.subjectFilter.value;
	    }
    //If the filter has changed, get a new message list.
    var filterTester="";
    var searchTester="";
    if(session.attributes.readFilter){filterTester=session.attributes.readFilter;}
    if(session.attributes.searchString){searchTester=session.attributes.readFilter;}    
	if(myFilter==filterTester&&searchString==searchTester){useExistingList=true;}
	if(!searchString){searchString="";}
	if(!useExistingList){
        switch(myFilter){
            case ' new':
                query=query + "%20is:unread";
                break;
            case ' old':
                query=query +"%20is:read";
                break;
		    case ' starred':
		        query = query +"%20is:starred";
		        break;
                default:
             }
	//make the actual call to google API
   	   getGmail(myPath,query,session, function mailResponseCallback(err, mailResponse) {
        	if (err) {
		//error getting messages
	    		if(err=="Error: 401"){
				makeResponse(session,response,2);
			    } else {
			            session.attributes.helpContext=3;
			            makeResponse(session,response,3);
        		 } 
        	} else 
        	{	
        	    if(mailResponse.resultSizeEstimate>0){	//message list returned
            	    session.attributes.tmpreadFilter=myFilter;
		            session.attributes.tmpsearchString = searchString;
		            session.attributes.tmpmessageList=mailResponse;
		            session.attributes.tmpQuery=query;
			        session.attributes.helpContext=12;
	    	        makeResponse(session,response,4);
        	    } else {	//no messages found        	    
        	        session.tmpreadFilter="";
        	        session.attributes.tmpsearchString = "";
		            session.attributes.tmpmessageList="";
		            session.attributes.tmpQuery="";
        	        if(myFilter==' total'){myFilter='';}
        	        if(session.attributes.messageList){session.attributes.helpContext=2;}
        	        else {session.attributes.helpContext=1;}
			        makeResponse(session,response,5,myFilter,searchString);
        	       }
        	}
    	   });
	} else //user asked for a count of the same list already being reviewed
	{
		session.attributes.helpContext=5;
		session.attributes.tmpreadFilter="";
		session.attributes.tmpsearchString="";
		session.attributes.tmpmessageList="";
		session.attributes.tmpQuery="";
		makeResponse(session,response,6);

    }
}
    
function getSummary (intent, session, response) {
//	handles many intents - this finds and reads summary of each message
//initialize variables
    var myFilter=""; //will hold value for selection of new,old,starred or all messages.
	var searchString=""; //will hold the rest of the search parameters, if any.
	var query="&q=in:inbox"; //holds the query string in gMail API format, skil only searches inbox for now
	var useExistingList=false; //determines whether a new call to google for a message list is needed.
	var myIndex=session.attributes.messageIndex;
	    if(!myIndex){myIndex=0;}
	var name=intent.name;
	var myPath, messageID, messageList; //params for gmail http calls
//process AMAZON.NextIntent, AMAZON.PreviousIntent, GoToMessageIntent indexing changes + error handling
    if(name=='AMAZON.NextIntent'||name=='AMAZON.PreviousIntent'||name=='GoToMessageIntent'){
        useExistingList=true;
        if(!session.attributes.messageList){ //if there is no message list but user is asking to move around one
            session.attributes.helpContext=4;
            makeResponse(session,response,7); //response prompts user to check messages first.
        } else {
            switch(name){
                case 'AMAZON.NextIntent':
                    ++myIndex;
                    break;
                case 'AMAZON.PreviousIntent':
        	        --myIndex;
        	        break;
                case 'GoToMessageIntent':
        	        if(!intent.slots.messagenumber.value){
        	            session.attributes.helpContext=6;
        	            makeResponse(session,response,10,'outofbounds')}
        		    else{myIndex=intent.slots.messagenumber.value-1;}
            	    break;
                default:
    	    }
        }
    }
	//handle stored info if this was called from getCount function
	if(session.attributes.tmpmessageList){
		if(name=='AMAZON.YesIntent'){			//user wants to use the new search
			session.attributes.readFilter=session.attributes.tmpreadFilter;
			session.attributes.searchString=session.attributes.tmpsearchString;
			session.attributes.messageList= session.attributes.tmpmessageList; 
			session.attributes.lastQuery = session.attributes.tmpQuery;
			myIndex = 0;
			useExistingList=true;
			session.attributes.messageIndex=0;
		} else {  					//user said anything but yes after search in getCount
			//if user said anything that can't be a new search:
			if(name!='ReviewIntent'&&name!='RefreshIntent'){
			    useExistingList=true;
			}
		}
		session.attributes.tmpreadFilter="";
		session.attributes.tmpsearchString="";
		session.attributes.tmpmessageList="";
		session.attributes.tmpQuery="";
	} else {
		if(name=='ReviewIntent'){ 	//all other intents use existing filters and can skip this.  
			//check for filters on the intent:
    		var readSlot=intent.slots.readFilter.value;
			var dateSlot=intent.slots.dateFilter.value;
			//if no previous filter and no search is requested now, default to new messages:
			if(!readSlot&&!session.attributes.readFilter&&!session.attributes.searchString) //no previous filter and nothing in "new/old/starred"
			{
    			if(!intent.slots.fromFilter.value&&!intent.slots.subjectFilter.value&&!dateSlot){ //no other search params
    			    myFilter=' new';}
                else { //no old search, but there is something searched besides "new/old/starred." Assume this means all
                    myFilter=" total";}
    		}
			//if something is in the intent slot, standardize the word choices the user had:
			if(readSlot){
				if(readSlot.match('read')||readSlot.match('old')){myFilter=' old';}       
				if(readSlot.match('unread')||readSlot.match('new')){myFilter=' new';}
				if(readSlot=='all'||readSlot=='total'){myFilter=' total';}
				if(readSlot.match('starred')||readSlot.match('important')){myFilter=' starred';}    
			}
			if(!myFilter){myFilter=" total";}
			switch(myFilter){
                	case ' new':
                    	query=query + "%20is:unread";
                    	break;
                	case ' old':
			           	query=query +"%20is:read";
						break;
					case ' starred':
						query = query +"%20is:starred";
						break;
						default:
             	}
			//handle the date, recorded by Alexa as P[yY][mM][dD][T[hH][mM][s[.s]S]]
			//where lower case is a number. convert it all to days.
			if(dateSlot){
				searchString = " sent in the last";
				var daycounter=0;
				var lastItem;
				var errFlag;
				var testItem;
				for (var indexer = 0; indexer < dateSlot.length; indexer++) {
					testItem = dateSlot.substr(indexer,1);
					if(isNaN(testItem)){
						switch(testItem){
							case 'P':
								break;
							case 'Y':
    							if(lastItem == 1){searchString=searchString+" year";}
								else{searchString=searchString+" "+lastItem+" years";}
								daycounter=daycounter+lastItem*365;
								break;	
							case 'M':
								if(lastItem == 1){searchString=searchString+" month";}
								else{searchString=searchString+" "+lastItem+" months";}
								daycounter=daycounter+lastItem*30;
								break;
							case 'W':
								if(lastItem == 1){searchString=searchString+" week";}
								else{searchString=searchString+" "+lastItem+" weeks";}
								daycounter=daycounter+lastItem*7;
								break;
							case 'D':
								if(lastItem == 1){searchString=searchString+" day";}
								else{searchString=searchString+" "+lastItem+" days";}
								daycounter=daycounter+lastItem;
								break;
							case 'T':
								errFlag=true;
								break;
							default:
								errFlag=true;
							}
						lastItem=testItem;
					} else {
						if(isNaN(lastItem)){lastItem=testItem;}
						else{lastItem = parseInt(lastItem.toString()+testItem.toString());}
					}
					if(errFlag) {
					    if(!session.attributes.messageList){session.attributes.helpContext=1;}
					    else{session.attributes.helpContext=2;}
						makeResponse(session,response,1);
					}
				}
				query = query+"%20newer_than:"+daycounter+"d";
				}
				//get the rest of the search parameters
				if(intent.slots.fromFilter.value){
					searchString=searchString+" from "+intent.slots.fromFilter.value;
					query = query+"%20from:"+intent.slots.fromFilter.value;
				}
				if(intent.slots.subjectFilter.value){
					searchString=searchString+" about "+intent.slots.subjectFilter.value;
					query = query +"%20subject:"+intent.slots.subjectFilter.value;
				}
			} //end of if statement that started the search for intent filters
		} //end of else statement about tmp stored strings
	
//If there is no existing message list, user asked for a refresh, or the filter has changed, get a new message list.
//set variables to help with undefined comparing to ""
    if(session.attributes.messageList){
        messageList=session.attributes.messageList;
        if(!myFilter&&!searchString){
	        myFilter=session.attributes.readFilter;
		    searchString=session.attributes.searchString;
	    }
    }
    var filterTester="";
    var searchTester="";
    if(session.attributes.readFilter){filterTester=session.attributes.readFilter;}
    if(session.attributes.searchString){searchTester=session.attributes.readFilter;}    
	if(myFilter==filterTester&&searchString==searchTester&&messageList){useExistingList=true;}
	if(intent.name=='RefreshIntent'){
	    useExistingList=false;
	    myFilter=session.attributes.readFilter;
	    searchString=session.attributes.searchString;
	    query=session.attributes.lastQuery;
	}
	if(!searchString){searchString="";}
	if(!myFilter){myFilter="";}
	if(!useExistingList){
		//make the actual call to google API
		myPath = "/gmail/v1/users/me/messages";
		session.attributes.lastQuery=query;
		session.attributes.messageIndex = 0;
   	   	session.attributes.attachments="";
    	session.attributes.currentMessage="";
    	session.attributes.messageList="";
    	session.attributes.readFilter = myFilter;
		session.attributes.searchString = searchString;
   	   	getGmail(myPath,query,session, function mailResponseCallback(err, mailResponse) {
            if (err) {
	    		if(err=="Error: 401"){
					makeResponse(session,response,2); //user needs to link account
				} else { //some other error getting info back from Google
    	    		session.attributes.helpContext=3;
            		makeResponse(session,response,3);
        		} 
        	} else {
			//successfully got the new list, start the speech responses and handle zero length.
        		if(mailResponse.resultSizeEstimate===0){
					if(!session.attributes.messageList){session.attributes.helpContext=1;}
					else{session.attributes.helpContext=2;}
					makeResponse(session,response,5,myFilter,searchString);
        	    } else {
        	        session.attributes.messageList = mailResponse;
				    //call gmail again for first message
				    messageID=mailResponse.messages[0].id;
				    query="&format=METADATA";
				    myPath = "/gmail/v1/users/me/messages/"+messageID;
				    getGmail(myPath,query,session, function mailResponseCallback2(err2, mailResponse2) {
       				    if (err2) {
	    				    if(err2=="Error: 401"){
                                makeResponse(session,response,2); //user need to re-link account
					        } else {
					            session.attributes.helpContext=3;
					            session.attributes.currentMessage="";
					            makeResponse(session,response,3);
        			        } 
        			    } else { //read first message.
        			        if(!mailResponse2){
        			            session.attributes.helpContext=3;
    	        			    session.attributes.currentMessage="";
    	        			    makeResponse(session,response,3);
        			        }
        			        var subject;
        			        var date;
        			        var from;
						    for (var headerIndex = 0; headerIndex < mailResponse2.payload.headers.length-1; headerIndex++) {
				                switch(mailResponse2.payload.headers[headerIndex].name){
                				    case 'Subject':
                    				    subject = makereadable(mailResponse2.payload.headers[headerIndex].value);
                        				break;
                    				case 'From':
                        				from = makereadable(mailResponse2.payload.headers[headerIndex].value);
                 	   	    			break;
                			    	case 'Date':
                    			    	let tmpdate = new Date(mailResponse2.payload.headers[headerIndex].value);
                    			    	let today= new Date();
                    			    	if(tmpdate.toDateString()==today.toDateString()){
                    			    	    date="today";}
                    			    	else {
                    			    	    date = tmpdate.toDateString();
                    			    	    //remove any leading zero from the day to correct Alexa speech quirk.
                    			    	    if(date.charAt(8)=='0'){date=date.replace("0", "");}
                    			    	}
                    					break;
            	       				default:
    				    		}
               		        }
		        	        session.attributes.helpContext=6;
  			        	    session.attributes.readFilter=myFilter;
  			        	    session.attributes.searchString=searchString;
			                session.attributes.currentMessage={"id":messageID,"from":from,"date":date,"subject":subject};
                			makeResponse(session,response,8);
                    	}
                    });
        	    }
        	}
        });
    }
    else {
    //just use the existing message list, but get another message;
    var problem="";
	var listlength=messageList.resultSizeEstimate;
	//circle back and error check for valid message index (incremented/decremented above but no err check)
    if(myIndex>=listlength&&name==='AMAZON.NextIntent'){problem = 'reachedend';}
    if(myIndex<0&&name==='AMAZON.PreviousIntent'){problem = 'reachedfirst';}
    if(name==='GoToMessageIntent'){
        if(myIndex<0||myIndex>listlength){problem = 'outofbounds';}
    }
	session.attributes.helpContext=6;
    if(problem){makeResponse(session,response,10,problem);}
    else{
    messageID=messageList.messages[myIndex].id;
	myPath = "/gmail/v1/users/me/messages/"+messageID;
	query="&format=METADATA";
	getGmail(myPath,query,session, function mailResponseCallback3 (err, mailResponse) {
    if (err) {
	    if(err=="Error: 401"){
            makeResponse(session,response,2);
		} else {
    	   session.attributes.helpContext=3;
    	   session.attributes.currentMessage="";
    	   session.attributes.messageIndex=myIndex;
            makeResponse(session,response,3);
            } 
        } else { //read first message.
        if(!mailResponse){
    	   session.attributes.helpContext=3;
    	   session.attributes.currentMessage="";
    	   session.attributes.messageIndex=myIndex;
            makeResponse(session,response,3);  
        } else {
            var subject;
            var date;
            var from;
		    for (var headerIndex = 0; headerIndex < mailResponse.payload.headers.length-1; headerIndex++) {
			switch(mailResponse.payload.headers[headerIndex].name){
                case 'Subject':
                    subject = makereadable(mailResponse.payload.headers[headerIndex].value);
                	break;
                case 'From':
                	from = makereadable(mailResponse.payload.headers[headerIndex].value);
                    break;
                case 'Date':
                	let tmpdate = new Date(mailResponse.payload.headers[headerIndex].value);
                    let today= new Date();
                    if(tmpdate.toDateString()==today.toDateString()){
                        date="today";}
                    else {date = tmpdate.toDateString();
                        //remove any leading zero from the day to correct Alexa speech quirk.
                        if(date.charAt(8)=='0'){date=date.replace("0", "");}
                    }
                    
                    break;
            	default:
    		}
        }
		    var postData = "{'function':'modifyMsg','parameters':['"+messageID+"','MarkReadIntent']}";
            runScripts (postData, session, function scriptCallback(err,scriptResponse){});
      		session.attributes.messageIndex=myIndex;
      		session.attributes.attachments="";
  	    	session.attributes.currentMessage={"id":messageID,"from":from,"date":date,"subject":subject};
  	    	session.attributes.helpContext=6;
            makeResponse(session,response,9);
        }
        }
    });
    }
    }
}

function messageDetails(intent, session, response){
    var messageID=session.attributes.currentMessage.id;
    if(!messageID){
        session.attributes.helpContext=4;
        makeResponse(session,response,7);
    } else {
         var postData = "{'function':'getPlainBody','parameters':['"+messageID+"']}";
        runScripts (postData, session, function scriptCallback(err,scriptResponse){
     	    if (err) {
    			session.attributes.helpContext=3; //alert user to error
    			makeResponse(session,response,3);
	    	} else {
	            var resp;
	       	    try{
    		        resp=JSON.parse(scriptResponse).response.result;
				    var plainResponse=makereadable(resp);
				    session.attributes.helpContext=7;
    			    makeResponse(session,response,11,plainResponse);
	       		} catch(e){
		            session.attributes.helpContext=3;
    				makeResponse(session,response,3);
		        }
	       	}
        });
    }
}
    
function modifyMessage(intent, session, response){
    var postData;
    var messageID;
    if(session.attributes.currentMessage){messageID=session.attributes.currentMessage.id;}
    if(!messageID){
        session.attributes.helpContext=4;
        makeResponse(session,response,7);
    }
	else{
        session.attributes.helpContext=6;
	    postData = "{'function':'modifyMsg','parameters':['"+messageID+"','"+intent.name+"']}";
	    runScripts (postData, session, function scriptCallback(err,scriptResponse){
		    if (err) {
			    session.attributes.helpContext=3;
                makeResponse(session,response,3);
		    } else {
		        var resp;
		        try{
                    resp=JSON.parse(scriptResponse).response.result;
			        if(resp=='OK'){
			            session.attributes.helpContext=6;
                	    makeResponse(session,response,12,intent.name);
				    } else {
				       	session.attributes.helpContext=3;
                        makeResponse(session,response,3);
				    }
		        } catch(e){
				    session.attributes.helpContext=3;
                    makeResponse(session,response,3);
				}						  
			}
        });
	}
}
    
function replyMessage(intent, session, response){
    var postData;
    var replyslot;
    if(!session.attributes.currentMessage){
        session.attributes.helpContext=4;
        makeResponse(session,response,7);
    }
	else{
	     var messageID=session.attributes.currentMessage.id;
	    if(intent.name!='AMAZON.YesIntent'){
            replyslot = intent.slots.replymessage.value;
            if (!replyslot) {
                session.attributes.helpContext=8;
                makeResponse(session,response,13);
            } else {
                session.attributes.helpContext=9;
                session.attributes.lastIntent=intent;
                makeResponse(session,response,14,replyslot);
            }
	    } else {    
            var FnName;
            var content=session.attributes.lastIntent.slots.replymessage;
            if(session.attributes.lastIntent.name=='ReplyIntent'){FnName = 'sendReply';}
            if(session.attributes.lastIntent.name=='ReplyAllIntent'){FnName = 'sendReplyAll';}
            session.attributes.lastIntent="";
	        postData = "{'function':"+FnName+",'parameters':['"+messageID+"','"+content+"']}";
	        runScripts (postData, session, function scriptCallback(err,scriptResponse){
			    if (err) {
            		session.attrributes.helpContext=3;
            		makeResponse(session,response,3);
		        } else {
		            var resp;
		            try{
            	       resp=JSON.parse(scriptResponse).response.result;
				        if(resp=='OK'){
					        session.attrributes.helpContext=6;
						    makeResponse(session,response,15);
						} else {
						    session.attrributes.helpContext=3;
            		        makeResponse(session,response,3);
						}
		            } catch(e){
		                session.attrributes.helpContext=3;
    		            makeResponse(session,response,3);
		            }
			    }
            });
	    }
    }
}

function setPrinter(intent, session, response){
    var printSlot = intent.slots.printernumber.value;
    var mytoken=session.user.accessToken;
    if(!printSlot){
        session.attributes.helpContext=10;
        makeResponse(session,response,16);
    } else {
        var printerIndex = printSlot-1;
        if(!session.attributes.printers){
		    var postData= "{'function':'getPrinterList','parameters':['"+mytoken+"']}";
		    runScripts (postData, session, function scriptCallback(err,scriptResponse){
			    if (err) {
            	    session.attributes.helpContext=3;
            	    makeResponse(session,response,3);
        		} else {
		        	var printers;
		        	try{
            		    printers=JSON.parse(scriptResponse).response.result;
				        if(printers.length === 0) {
					        session.attributes.helpContext=11;
            	            makeResponse(session,response,17);
				        }
				        if(printers.length>1){
				            session.attributes.printers=printers;
				            if(0<=printerIndex&&printerIndex<printers.length){
				                session.attributes.selectedPrinter=printSlot;
				                if(session.attributes.messageList){session.attributes.helpContext=6;}
				                else {session.attributes.helpContext=4;}
				                makeResponse(session,response,18,printerIndex);
				            } else {
				                session.attributes.helpContext=10;
					            makeResponse(session,response,19);
				            }
				        }
				        if(printers.length == 1) {
				            session.attributes.selectedPrinter=1;
				            session.attributes.printers=printers;
				            if(session.attributes.messageList){session.attributes.helpContext=6;}
				            else {session.attributes.helpContext=4;}
				            makeResponse(session,response,18,0);
				        }
		        	} catch(e){
                       session.attributes.helpContext=3;
            	        makeResponse(session,response,3);
				    }
		        }
		    });
        } else {
            var printLen = session.attributes.printers.length;
            if(printLen>1){
			if(0<=printerIndex&&printerIndex<printLen){
			    session.attributes.selectedPrinter=printSlot;
			    if(session.attributes.messageList){session.attributes.helpContext=6;}
				else {session.attributes.helpContext=4;}
				makeResponse(session,response,18,printerIndex);
			} else {
				session.attributes.helpContext=10;
				makeResponse(session,response,19);
			}
            } else {
                session.attributes.selectedPrinter=1;
                if(session.attributes.messageList){session.attributes.helpContext=6;}
				else {session.attributes.helpContext=4;}
				makeResponse(session,response,18,0);
            }
        }     
    }
}

function printStuff(intent, session, response){
//First, bounce with error if user said print while nothing exists to print;
	if(!session.attributes.currentMessage){
		session.attributes.helpContext=4;
		makeResponse(session,response,7);
	} else {
//set up variables
	var messageID=session.attributes.currentMessage.id;
    var mytoken=session.user.accessToken;
  	var postData,printerID,attachNum,resp,pages;
	var selectedPrinter=session.attributes.selectedPrinter;
	var printers=session.attributes.printers;
    if(!printers){   //printers have not been retrieved from Cloud Print Service
		//call Google apps scriupt to get printer list
		postData= "{'function':'getPrinterList','parameters':['"+mytoken+"']}";
		runScripts (postData, session, function scriptCallback(err,scriptResponse){
			 if (err) { //error handling
				session.attributes.helpContext=3;
            	makeResponse(session,response,3);
        	} else {
        	    try {
				    printers=JSON.parse(scriptResponse).response.result;
				    if(printers.length === 0) { //message to user no online printers found;
				        session.attributes.helpContext=11;
            			makeResponse(session,response,17);
				    }
				    if(printers.length>1){	//message to user to choose printer to use		
					    session.attributes.printers=printers;
						session.attributes.helpContext=10;
            			makeResponse(session,response,19);
				    }
				    if(printers.length == 1) { //if only one printer, select it without user input
				        selectedPrinter=1; //id = index +1. matches spoken input, not array.					
				        session.attributes.selectedPrinter=selectedPrinter;
				        printerID=printers[selectedPrinter-1][0];
				        session.attributes.printers=printers;
						//set up for 2 apps script calls - postData used now to get page count; session data sets up what to send after later user confirmation
				        switch(intent.name){
					        case 'PrintMessageIntent': //user asked to print message body
					            postData="{'function':'print','parameters':['"+mytoken+"','__google__docs','"+messageID+"','']}";
						         session.attributes.printdata="{'function':'print','parameters':['"+mytoken+"','"+printerID+"','"+messageID+"','']}";
							    break;
					        case 'PrintAttachmentsIntent': //user asked to print an attachment
						        if(!session.attributes.attachments){ //attachments have not been checked for the message (program doesn't check now because user may think there is a different current message; places decision in user control)
							       session.attributes.helpContext=6;
					               makeResponse(session,response,22);
					            } else {
					                if(session.attributes.attachments[0]=="no attachments"){ //message has no attachments
							            session.attributes.helpContext=6;
						    	        makeResponse(session,response,23);
					                } else {
						                if(!intent.slots.AttachNum.value){ //user asked for an attachment but Alexa did not record which
							                session.attributes.helpContext=6;
								            makeResponse(session,response,24);
						                } else { //Alexa understood the requested attachment number
						                    attachNum=intent.slots.AttachNum.value-1;
							                if(attachNum>=0&&attachNum<session.attributes.attachments.length){ //everything looks OK to print
								                postData="{'function':'print','parameters':['"+mytoken+"','__google__docs','"+messageID+"',"+attachNum+"]}";
								                session.attributes.printdata="{'function':'print','parameters':['"+mytoken+"','"+printerID+"','"+messageID+"',"+attachNum+"]}";
						                    } else { //Alexa recorded a requested attachment number that does not exist
							                    session.attributes.helpContext=6;
								                makeResponse(session,response,24);
							                }
						                }
					                }
					            }
							//Yes Intent can't get here as we are inside the case where no printers found.
						  } //end of switch
						 //call apps script to print to Google drive, get returned page count and delete resulting file from Drive
						 runScripts (postData, session, function scriptCallback(err,scriptResponse){
    						if (err) {
    							session.attributes.helpContext=3;
								makeResponse(session,response,3);
							} else {
							    try{
            			            resp=JSON.parse(scriptResponse).response.result;
							        if(resp.length==2){ 
						            pages=resp[1];
							        //ask for user to confirm print job, with speech based on intent to print message or attachment
	    						    switch(intent.name){
            						    case 'PrintMessageIntent':
			                        	    session.attributes.helpContext=13;
    			                	        makeResponse(session,response,20,pages);
	    		        	                break;
		    			                case 'PrintAttachmentsIntent':
			    	                        session.attributes.helpContext=13;
				                            makeResponse(session,response,21,attachNum,pages);
					    	            }
							        } else {	
        								session.attributes.helpContext=3;
		    							makeResponse(session,response,3);  
								    }
							    } catch(e){
				                    session.attributes.helpContext=3;
                    				makeResponse(session,response,3);
			                    }
							}
						 });
				    } //end of if (printer length=1)
				} catch(e){
				    session.attributes.helpContext=3;
                    makeResponse(session,response,3);
			     }
        	} //end of else for outer http call
		}); //end of outer call to runscripts to get printer list
	} else { //The printer list was already fetched from cloud print
	    if(!selectedPrinter){ //no printer is selected
	        if(printers.length === 0) { //no priners are online
		        session.attributes.helpContext=11;
                makeResponse(session,response,17);
	        }
	        if(printers.length>1){ //user needs to choose a printer because there are more than one
		        session.attributes.helpContext=10;
                makeResponse(session,response,19);
	        }
	        if(printers.length == 1) { //only one exxists, use it.
		        selectedPrinter=1; //id = index +1. matches spoken input, not array.					
		        session.attributes.selectedPrinter=selectedPrinter;
		        printerID=printers[selectedPrinter-1][0];
	        }
	    } else {printerID=session.attributes.printers[selectedPrinter-1][0];}
	    //process print job setup - draft or final (yes intent = final)
		switch(intent.name){
	        case 'PrintMessageIntent':
	            postData="{'function':'print','parameters':['"+mytoken+"','__google__docs','"+messageID+"','']}";
		        session.attributes.printdata="{'function':'print','parameters':['"+mytoken+"','"+printerID+"','"+messageID+"','']}";
    			break;
	    	case 'PrintAttachmentsIntent':
		    	if(!session.attributes.attachments){
			    	session.attributes.helpContext=6;
				    makeResponse(session,response,22);
    			} else {
	    			if(session.attributes.attachments[0]=="no attachments"){
    					session.attributes.helpContext=6;
	    				makeResponse(session,response,23);
		    		}
			    }
    			if(!intent.slots.AttachNum.value){
	    		    session.attributes.helpContext=6;
		    		makeResponse(session,response,24);
			       } else {
			            attachNum=intent.slots.AttachNum.value-1;
			    	    if(attachNum>=0&&attachNum<session.attributes.attachments.length){
				            postData="{'function':'print','parameters':['"+mytoken+"','__google__docs','"+messageID+"',"+attachNum+"]}";
    						session.attributes.printdata="{'function':'print','parameters':['"+mytoken+"','"+printerID+"','"+messageID+"',"+attachNum+"]}";
	    				} else{
		    			    session.attributes.helpContext=6;
			    			makeResponse(session,response,24);
				    	}
    				}
	    		break;
		        case 'AMAZON.YesIntent':
        		    postData = session.attributes.printdata;
		            session.attributes.printdata="";
            }
        runScripts (postData, session, function scriptCallback(err,scriptResponse){
	        if (err) {
			    session.attributes.helpContext=3;
    			makeResponse(session,response,3);
    		} else {
	    	    try{
                	resp=JSON.parse(scriptResponse).response.result;
					if(resp.length==2){ 
    					pages=resp[1];
        	            switch(intent.name){
	                        case 'AMAZON.YesIntent':
	                            session.attributes.helpContext=6;
	                            makeResponse(session,response,25);
    	                        break;
	                        case 'PrintMessageIntent':
                                session.attributes.helpContext=13;
                                makeResponse(session,response,20,pages);
                                break;
                            case 'PrintAttachmentsIntent':
                                session.attributes.helpContext=13;
                                makeResponse(session,response,21,attachNum,pages);
    	                }
	                } else {
			    	    session.attributes.helpContext=3;
				        makeResponse(session,response,3);  
    			    }
	    	    } catch(e){
		    		session.attributes.helpContext=3;
			    	makeResponse(session,response,3);
    			}
	    	}
            });
	}
    }
}

function listAttachments(intent, session, response){
//handles ListAttachmentsIntent and the yes intent after question about listing in more detail.
    if(intent.name=='ListAttachmentsIntent'){
    	if(!session.attributes.currentMessage){
       		session.attributes.helpContext=4;
		    makeResponse(session,response,7);
	    } else {
	        var messageID=session.attributes.currentMessage.id;
    	    var mytoken = session.user.accessToken;
    	    var postData = "{'function':'getAttachments','parameters':['"+messageID+"']}";
    	    runScripts (postData, session, function scriptCallback(err,scriptResponse){
	            if (err) {
            		session.attributes.helpContext=3;
    			makeResponse(session,response,3);
	    	    } else {
		    	    var attachments;
			        try{
                        attachments=JSON.parse(scriptResponse).response.result;
                    	if(attachments.length===0){
            				session.attributes.attachments=["no attachments"];
			            	session.attributes.helpContext=6;
            				makeResponse(session,response,37);
                	  	 } else {
				            session.attributes.attachments = attachments;
            				session.attributes.helpContext=6;
			            	makeResponse(session,response,26);
			             }
			        } catch(e){
				        session.attributes.helpContext=3;
        				makeResponse(session,response,3);
		    	   }			     
		    }
            });
        }
    } else {
        session.attributes.helpContext=6;
	    makeResponse(session,response,27);
    }
}

function helpTheUser(intent, session, response){
	var cardTitle, cardContent, speechText,speechOutput,speakIndex;
	var context;
	var repromptOutput="You can say repeat that, show me, quit, or say wait, for more time.  What would you like to do?"; 
	if(intent.name=='HelpWithSlotIntent'){context=20;}
	else{context=session.attributes.helpContext;}
    switch(context){
	case 1: //search params error or none found, no existing message list
		session.attributes.helpContext = 30;
		speechOutput="If you want me to get all of your unread messages, say review my new messages.  To get everything, say review all my messages.  You can also search by any combination of whether the message has been read or not, who it is from, a word in the subject line, or how recently it was received. For some example searches, say help again. What would you like to do?";
		break;
	case 2: //search params error or none found, previous message list exists
		session.attributes.helpContext=30;
		speechText="<speak><p>Here are some things you can say.</p><p>To interrupt me, you can say Alexa, followed by a command.</p> <p>You can say things like, next message,</p><p>get my unread messages,</p><p> or review all my messages.</p> <p>You can also search by whether the message has been read</p>, <p>who it is from,</p> <p>a word in the subject line,</p> <p>or how recently it was received.</p> <p> For some example searches, say help again.</p> What would you like to do?</speak>";
		speechOutput={speech:speechText,type:'SSML'};
        break;
	case 3: //http error other than authorization issue.
		speechOutput="I had trouble contacting G Mail to process your most recent request.  You can try again, say other commands like check my email, or say quit to exit.  What would you like to do?";
		if(session.attributes.currentMessage){session.attributes.helpContext=6;}
	    else {session.attributes.helpContext=4;}
		break;
	case 4: //user asked for something that requires a message list first.
		session.attributes.helpContext=30;
		speechText='<speak><p>Here are some things you can say.</p><p>To interrupt me, you can say Alexa, followed by a command.</p><p> Before I can do anything else, I need to retrieve a list of your messages.</p><p> If you want me to get only your unread messages, say get my new messages.</p><p> For all of your new and previously <w role="ivona:VBD">read</w> messages, say review all my messages.</p><p> You can also search by whether the message has been read,</p><p> if you marked it as starred,</p><p> who it is from,</p><p> a word in the subject line,</p><p> or how recently it was received.</p><p> For some example searches, say help again.</p> What would you like to do?</speak>';  
		speechOutput={speech:speechText,type:'SSML'};
        break;
	case 5: //returned count of message list already under review.
		session.attributes.helpContext=30;
		speakIndex=session.attributes.messageIndex+1;
		speechText="<speak><p>Here are some things you can say.</p><p>To interrupt me, you can say Alexa, followed by a command.</p> <p> You can try a different search, or continue working with the current list.</p> <p>To hear the current message summary again, say go to message "+speakIndex+".</p><p> You can also say read more,</p><p> print this,</p><p> get the attachments,</p><p> erase this,</p><p> mark this unread,</p><p> mark this starred,</p><p> or remove the star.</p><p> If you would like example searches, say help again.</p> What would you like to do?</speak>";  
		speechOutput={speech:speechText,type:'SSML'};
        break;
	case 6: //options for working with a message or navigating the list.
	    speakIndex=session.attributes.messageIndex+1;
		speechText="<speak><p>Here are some things you can say.</p><p>To interrupt me, you can say Alexa, followed by a command.</p><p> To hear the most recent message summary again, say go to message "+speakIndex+".</p><p> You can also say read more,</p><p> print this,</p><p> get the attachments,</p><p> erase this,</p><p> mark this unread,</p><p> mark this starred,</p><p> or remove the star.</p><p> You can go to other messages on your list by saying next,</p><p> or previous,</p><p> or you can ask for a new search.</p><p> If you would like example searches, say help again.</p> What would you like to do?</speak>";
		speechOutput={speech:speechText,type:'SSML'};   
		session.attributes.helpContext=30;
        break;
	case 7: //Alexa is reading message details, possibly badly.
		speechOutput="Some messages are designed to look good, but are difficult for me to read.  If the message doesn’t sound right, you can say show me, to view it in the Alexa app, or say print this, if you would like me to send it to your printer. You can also say things like next message, say help again for more choices, or say quit to exit. What would you like to do?"; 
		session.attributes.helpContext=6;
		break;
	case 8: //help after saying reply, with empty slot
	    session.attributes.helpContext=6;
		speechText="<speak><p>I can send very simple replies, about one sentence long.</p><p>  I'll read your message and ask for your approval before I send anything.</p><p>  If you were not trying to reply, you can say a different command, or say help again for more choices.</p><p>  If you want to send a response, say reply, or reply all, followed by your short message.</p><p> What would you like to do?</speak>";
		speechOutput={speech:speechText,type:'SSML'};  
        break;
	case 9: //asked for help after being asked to confirm sending a reply
		speechOutput="You can say yes, to send this message.  If you need to correct it, say no, and try a new reply command.  You can also say a different command, or say quit if you're finished.  Would you like to send this message?";
        break;
	case 10: //user asked to set printer but slot was empty
	    if(session.attributes.currentMessage){session.attributes.helpContext=6;}
	    else {session.attributes.helpContext=4;}
		speechOutput="If you are not trying to print, you can say a different command.  If you want to print and you have more than one online coud printer, you can tell me which one to use for this session by saying something like, choose printer 1 or you can say help again for more choices.  What would you like to do?";
        break;
	case 11: //no printers were found
	    session.attributes.helpContext=4;
		speechOutput="I can send things to your printer using Google cloud print, a service that can connect your home printer to the Internet.  I sent a card to the Alexa app, with more information about how to use Google cloud print.  If your printer is already connected, please make sure it is turned on, and any computer it needs is also turned on and connected to the Internet.";
		if(session.attributes.currentMessage){
			session.attributes.helpContext=6;
			speechOutput= speechOutput+" To print the current message, say print this.  To print an attachment, say something like print attachment one. You can also say list the attachments, or say help again for more choices.";
		}
		speechOutput= speechOutput+" What would you like to do?";
		cardTitle = "How to get Google Cloud Print";
		cardContent = "Google Cloud Print is a service that can connect a home printer to the Internet.  The My Email skill can use this service to print messages and attachments. More information and setup instructions can be found by going to https://www.google.com/cloudprint/learn/ in an Internet browser.";
		break;
	case 12: //Alexa found results in a new search when old list exists. Just asked user to confirm.
		session.attributes.helpContext=6; 
		if(session.attributes.tmpmessageList.resultSizeEstimate==1){
			speechOutput="You can say yes to start at the first message I just found, or say no to go back to the list you were reviewing.  For more choices, say help again. Would you like to review it?";
		} else {
			speechOutput="You can say yes to start at the first message I just found, or say no to go back to the list you were reviewing.  For more choices, say help again. Would you like to review them?";
		}
		break;
	case 13: //just prompted to confirm print
		session.attributes.helpContext=6;
		speechOutput = "You can say yes, to send this to the printer, or say no to do something else.  If you want to change the print choices, try your command again.  You can also say help again for more choices, or say quit if you're finished.  Do you want to continue printing?";
		break;		
	case 14: //help after question about attachments
		session.attributes.helpContext=6;
		speechOutput = "You can say yes, to hear the names and types of the attachments to this message, or say no to do something else. You can also say help again for more choices, or say quit, if you're finished.  Would you like me to list the attachments?";
		break;		
	case 15: //user said help after Alexa asked for confirmation of a message deletion.
		speechOutput="When you ask me to erase a message, it isn’t permanently erased.  I move it to an email folder called trash.  You can recover messages in the trash by accessing your email on a computer, tablet or phone.  Unless you have changed your mail settings, Google will erase messages left in the trash for more than thirty days.  To continue moving the current message to the trash folder, say yes.  Otherwise, say no. Do you want me to move this to the trash?";
		break;
	case 16:
	    if(session.attributes.messageList){session.attributes.helpContext=6;}
	    else {session.attributes.helpContext=4;}
		speechOutput="To set an access pin, say set my pin, followed by a 4 digit number.  For example, you can say set my pin to 1 2 3 4.  Otherwise, you can say review my messages to continue, say help again for more options, or say quit to exit.  What would you like to do?";
		break;
	case 17:
		session.attributes.helpContext=6;
		speechOutput="I can send images to the Alexa app, if they are less than 2 Megabytes in size, and of the type, jpeg, or p n g.  You will need to use another email device to view images that I can't display.  You can say something like print attachment 1, next message, or say help again for more choices.  What would you like to do?";
		break;
	case 18: //wrong PIN
		speechOutput="Because you selected an access PIN, you won’t be able to use the skill without the PIN.  It should be a four digit number.  I sent a card to the Alexa app with instructions for resetting your PIN manually online.  If you know your PIN, you can say it now, or say quit to exit.  What is your access PIN?"; 
	    cardContent="Instructions for resetting your PIN are available online.  Please use a browser to go to email-skill.blogspot.com";
	    cardTitle="Help With My Email PIN Reset";
		break;
	case 19: //help after prompt to add a PIN
		speechOutput="Setting a four-digit PIN adds an extra layer of security to this skill, to prevent others with access to your Alexa device from reading your email.  This is optional, but once you do this,  you won’t be able to use the skill without the PIN.  If you say yes, I will help you set a PIN.  If you say no, I won't ask again, but you can add a PIN anytime by saying set my PIN.  Would you like to set a PIN now?"; 
	    break;
	case 20:
	    speechOutput = "Sorry.  I can't answer such specific questions, but whenever you say help, I'll try to give you an answer that explains what you are doing right then.  What else would you like to do?";
		if(session.attributes.messageList){session.attributes.helpContext=6;} 
		else {session.attributes.helpContext=4;}
		break;
	case 30: //user asked for example searches.
	    speechText="<speak><p>Here are some examples of how to search.</p><p> You can interrupt me any time by saying Alexa, followed by a command.</p>You can say things like, search for messages from Bob,<break time=\"700ms\"/>find all my messages about payment,<break time=\"700ms\"/> review unread messages from the last 2 weeks,<break time=\"700ms\"/>  get starred messages,<break time=\"700ms\"/> or search for messages about dinner, from Juan, received in the last 2 days.<break time=\"700ms\"/>  <p>There are many combinations, and it doesn't hurt anything to experiment.</p><p>  If you're not sure just give it a try, or say check my email, to get started.</p>  What would you like to do?</speak>";
	    speechOutput={speech:speechText,type:'SSML'};
	    break;
	default:  //user opened the skill with a request for help.
		speechOutput = "The my email skill lets you read, manage, and print your Google g mail using Alexa.  I sent a card to the Alexa app with a link to online instructions.  You can also say help while using the skill, for more specific coaching. To get started with your unread messages, you can say check my email, or you can say quit to exit. What would you like to do?";
	    cardContent="For more information and instructions for the My Email skill, use a browser to go to\r\n http://email-skill.blogspot.com";
	    cardTitle="Link to the My Email Skill Web Site";
		if(session.attributes.messageList){session.attributes.helpContext=6;} 
		else {session.attributes.helpContext=4;}
	}
	session.attributes.lastSpeech=speechOutput;
	if(cardTitle){response.askWithCard(speechOutput, repromptOutput,cardTitle, cardContent);}
	else {response.ask(speechOutput,repromptOutput);}
}


function deleteConfirm(intent,session,response){
    var messageID;
    if(session.attributes.currentMessage){messageID=session.attributes.currentMessage.id;}
    if(!messageID){
	session.attributes.helpContext=4;
        makeResponse(session,response,7);
    }
	else{
	session.attributes.helpContext=15;
        makeResponse(session,response,30);
	}
}  

function questionYesHandler(intent, session, response){
    var speechOutput;
    switch (session.attributes.question){
        case 1: //would you like to review? (found messages)
            getSummary(intent,session,response);
            break;
	case 2: //confirm reply or reply all.  Send?
	        session.attributes.helpContext=6;
            replyMessage(intent,session,response);
            break;
        case 3: //confirm print job.  Send to printer?
            session.attributes.helpContext=6;
            printStuff(intent,session,response);
            break;
        case 4: //close your email?
            speechOutput="Goodbye.";
            response.tell(speechOutput);
            break;
        case 5: //move this to the trash? confirm.
            session.attributes.helpContext=6;
            modifyMessage(intent,session,response);
            break;
        case 6: //list the attachments?
            listAttachments(intent,session,response);
            break;
        case 7: //set a PIN
            session.attributes.helpContext=16;
	        makeResponse(session,response,32);
	        break;
        default:
            makeResponse(session,response,34);
    }

}

function questionNoHandler(intent, session, response){
    switch (session.attributes.question){
        case 1: //would you like to review? (newly found messages)
             makeResponse(session,response,28);
            break;
        case 2: //confirm reply or reply all?
            makeResponse(session,response,35);
            break;
        case 3: //confirm print?
            makeResponse(session,response,35);
            break;
        case 4: //close your email?
		    makeResponse(session,response,35);
            break;        
        case 5: //delete?
            makeResponse(session,response,35);
            break;
        case 6: //list your attachments?
            makeResponse(session,response,35);
            break;
        case 7:  //set a PIN?
            setpin(intent,session,response);
            break;
        default:
		    makeResponse(session,response,34);
        }
}

function showmeHandler(intent, session, response){
    var messageID, postData, k,imageattachments, matched, i, attachmentIndex;
    var resp, imageurl;
    if(!session.attributes.messageList){
        session.attributes.helpContext=4;
        makeResponse(session,response,7);
    } else {
        messageID=session.attributes.currentMessage.id;
	    if(intent.slots.AttachNum.value) {    //user asked "show me attachment {#}"
	        //extensive error checking section
	    	if(!session.attributes.attachments){ //have not checked for attachments yet
    	        postData = "{'function':'getAttachments','parameters':['"+messageID+"']}";
    	        //check for attachments and process results
    	        runScripts (postData, session, function scriptCallback(err,scriptResponse){
	            if (err) { //error getting attachments
            	    session.attributes.helpContext=3;
                	makeResponse(session,response,3);
	    	    } else {
		    	    var attachments;
			        try{
            	    	attachments=JSON.parse(scriptResponse).response.result;
                        if(attachments.length===0){ //no attachments
	    			        session.attributes.attachments=["no attachments"];
	    			        session.attributes.helpContext=6;
		    		        makeResponse(session,response,37); //tell user
    		    		} else {
    			    	    //check existing attachments for images that can go to app card
	    			    	session.attributes.attachments = attachments;
			                imageattachments=[];
    			            k;
	    	    	        matched=false;
	        		        for (i=0; i<session.attributes.attachments.length;++i){
	    				        if(session.attributes.attachments[i][0]=="an image"){
    					            k=i+1;
						            imageattachments.push(k);
						            if(k==intent.slots.AttachNum.value){matched=true;}
					            }
				            }
				            if(imageattachments.length===0){
				                session.attributes.helpContext=17;
			    		        makeResponse(session,response,38); //tell user none of the attachments can be displayed
		    		        } else {
	    	                    if(!matched){
	    	                        session.attributes.helpContext=17;
	    	                        makeResponse(session,response,39,imageattachments); //user requested attach can't be displayed. Offer alternate options.
	    	                    } else { //follow through intent
	    	                        attachmentIndex=intent.slots.AttachNum.value-1;
		                            postData = "{'function':'showAttachment','parameters':['"+messageID+"','"+attachmentIndex+"']}";
                                    runScripts (postData, session, function scriptCallback(err,scriptResponse){
		                                if (err) {
		                                    session.attributes.helpContext=3;
                                            makeResponse(session,response,3);
		                                } else {
                            		        resp;
		                                    try {
                            				    resp=JSON.parse(scriptResponse).response.result;
                            				    imageurl="https://www.googleapis.com/drive/v3/files/"+resp+"?alt=media&access_token="+session.user.accessToken;
                            				    session.attributes.helpContext=6;
	                                            makeResponse(session,response,40,attachmentIndex,imageurl);
			                                }catch(e){
				                                session.attributes.helpContext=3;
                                                makeResponse(session,response,3);
			                                }
		                                }
                                    });
				                }
		    		        }
			            }
			        } catch(e){
	    			    session.attributes.helpContext=3;
                	    makeResponse(session,response,3);
			    	}
		    	}
    	        });
		    } else { //attachments had already been fetched, still need to error check request
		        if(session.attributes.attachments[0].length==1){ //there are not attachments
		            session.attributes.helpContext=6;
		            makeResponse(session,response,37);
    		    } else { //check which attachments can go to card
	    			imageattachments=[];
		    		k;
			    	matched=false;
				    for (i=0; i<session.attributes.attachments.length;++i){
					    if(session.attributes.attachments[i][0]=="an image"){
					        k=i+1;
    						imageattachments.push(k);
	    					if(k==intent.slots.AttachNum.value){matched=true;}
		    			}
			    	}
				    if(imageattachments.length===0){ //no attachments are images that can be displayed in app
				        session.attributes.helpContext=17;
					    makeResponse(session,response,38);
    				} else { //there are some displayable, but not the one the user requested
	    			    if(!matched){
	    			        session.attributes.helpContext=17;
	    			        makeResponse(session,response,39,imageattachments);}
		    		}
			    }
		    attachmentIndex=intent.slots.AttachNum.value-1;
		    postData = "{'function':'showAttachment','parameters':['"+messageID+"','"+attachmentIndex+"']}";
            runScripts (postData, session, function scriptCallback(err,scriptResponse){
		    if (err) {
		        session.attributes.helpContext=3;
                makeResponse(session,response,3);
		    } else {
		        try {
				    resp=JSON.parse(scriptResponse).response.result;
				    var imageurl="https://www.googleapis.com/drive/v3/files/"+resp+"?alt=media&access_token="+session.user.accessToken;
				    session.attributes.helpContext=6;
	                makeResponse(session,response,40,attachmentIndex,imageurl);
			    }catch(e){
				    session.attributes.helpContext=3;
                    makeResponse(session,response,3);
			    }
		    }
            });  
            } 
        } else {
            session.attributes.helpContext=6;
            makeResponse(session,response,41);}
    }
}

//HANDLER FOR GET ACTIONS
function getGmail (myPath,query,session, mailResponseCallback) {
    let mytoken = session.user.accessToken;
    let options = {
		   host: 'www.googleapis.com',
		   path: myPath+"?access_token="+mytoken+query
	           }; 
    https.get(options, function (res) {
        let mailResponseString = '';
        if (res.statusCode != 200) {
	    if(res.statusCode === 401) {
		    return mailResponseCallback(new Error("401"));}
	    else {
            return mailResponseCallback(new Error("Non 200 Response"));
	    }
        }
        res.on('data', function (data) {
            mailResponseString += data;
        });
        res.on('end', function () {
            let mailResponseObject = JSON.parse(mailResponseString);
            if (mailResponseObject.error) {
                mailResponseCallback(new Error(mailResponseObject.error.message));
            } else {
                return mailResponseCallback(null, mailResponseObject);
            }
        });
    }).on('error', function (e) {
        return mailResponseCallback(new Error(e.message));
    });
}

//post handler to run Google Apps Scripts
function runScripts (postData, session,scriptCallback){
    var mytoken = session.user.accessToken;
    var scriptsID=process.env.scriptsID;
    var responseString="";
  	let options = {
	    host: "script.googleapis.com",
		method:"POST",
		headers: {
		    "Authorization":"Bearer "+mytoken,
		},
		path: "/v1/scripts/"+scriptsID+":run"
  	    };
	var req = https.request(options, function (res2) {
	 
        if (res2.statusCode != 200) {
            return scriptCallback(new Error("Non 200 Response"));
	    }
        res2.on('data', function (respdata) {
            responseString += respdata;
        });
        res2.on('end', function () {
    		return scriptCallback(null,responseString);
        });
    });
    req.on('error', function (e) {
        return scriptCallback(new Error("Non 200 Response"),null);
        });
    // write data to request body
    req.write(postData);
    req.end();
}

//Helper to make strings readable by Alexa
function makereadable(string){
    if(string.length>=7500){string=string.substr(0, 7499);}
	string = string.replace(/&amp/g,"&");
	string = string.replace(/ fwd:/," forward:");
	string = string.replace(/ re:/," reply:");
	string = string.replace(/&/g," and ");
    string = string.replace(/[^a-zA-Z0-9-*.,: @$]/g,"");
    string = string.replace(/\r?\n|\r/g, " ");
    return string;
 }
 
//checks if a pin is needed and/or provided correctly
function checkpin(intent,session, response){
    var myToken=session.user.accessToken;
    var mypin="";
    if(!session.attributes.pinok){
	    if(intent.name=='SayPINIntent'){
    	    if(!intent.slots.mypin.value){
        		session.attributes.helpContext=18;
		        makeResponse(session,response,42);
    	    } else {
       		    if(intent.slots.mypin.value.length!=4){
            		session.attributes.helpContext=18;
			        makeResponse(session,response,42);
        		} else {mypin=intent.slots.mypin.value;}
    	    }
	    }
   	    var postData = "{'function':'checkpin','parameters':['"+mypin+"','"+myToken+"']}";
		runScripts (postData, session, function scriptCallback(err,scriptResponse){
		    var resp;
		    if (err) {
			    session.attributes.helpContext=3;
			    makeResponse(session,response,3);
		    } else {
			    try {
				    resp=JSON.parse(scriptResponse).response.result;
		            switch(resp){
		            case 'locked':
	                    makeResponse(session,response,53);
	                    break;
        			case 'nomatch':
        			    if(intent.name=='SayPINIntent'){
    	    		        session.attributes.helpContext=18;
			    	        makeResponse(session,response,44,mypin);
    			        }
    			        else {
    			            session.attributes.lastIntent=intent;
    			            session.attributes.helpContext=18;
    				        makeResponse(session,response,43);
	    		        }
		        	    break;
	                case 'notset':
	                    session.attributes.pinok=true;
    	                if(intent.name=='SetPINIntent'){
	                        setpin(intent,session,response);
	                    } else {
	                        session.attributes.lastIntent=intent;
				            session.attributes.helpContext=19;
	                        makeResponse(session,response,45);
    	                }    
	    	            break;
		            case 'match':
			    	    session.attributes.pinok=true;
		      			//this section can't be reached midway through a session.  Switch actions are based on first intent.
            		    if(intent.name=='SayPINIntent'){
		                    intent=session.attributes.lastIntent;
		                }
		                switch(intent.name){
                        case 'CountIntent': //user asked How many... (change to default intro behavior)
            		        intent={
                                "name": "ReviewIntent",
                                "slots": {
                                    "fromFilter": {
                                        "name": "fromFilter"
                                    },
                                    "subjectFilter": {
                                    "name": "subjectFilter"
                                    },
                                    "readFilter": {
                                        "name": "readFilter",
                                        "value": "new"
                                    },
                                    "dateFilter": {
                                        "name": "dateFilter"
                                    }
                                }
	                         };
                            getSummary(intent,session,response);
                            break;
                        case 'ReviewIntent':
                            getSummary(intent,session,response);    
                            break;
                        case 'AMAZON.NextIntent':
                            getSummary(intent, session, response);
                            break;
                        case 'AMAZON.PreviousIntent':
             	            getSummary(intent, session, response);
 	                        break;
                        case 'RefreshIntent': //not a valid intent, so go to default behavior
		                    intent={
                                "name": "ReviewIntent",
                                "slots": {
                                    "fromFilter": {
                                        "name": "fromFilter"
                                    },
                                    "subjectFilter": {
                                      "name": "subjectFilter"
                                    },
                                    "readFilter": {
                                        "name": "readFilter",
                                         "value": "new"
                                    },
                                    "dateFilter": {
                                        "name": "dateFilter"
                                    }
                                }
	                        };
                            getSummary(intent,session,response);
                            break;
                        case 'SetPrinterIntent':
                            setPrinter(intent, session, response);
                            break;
                        case 'AMAZON.StartOverIntent': 
            		        intent={
                                "name": "ReviewIntent",
                                "slots": {
                                    "fromFilter": {
                                        "name": "fromFilter"
                                    },
                                    "subjectFilter": {
                                      "name": "subjectFilter"
                                    },
                                    "readFilter": {
                                        "name": "readFilter",
                                         "value": "new"
                                    },  
                                    "dateFilter": {
                                        "name": "dateFilter"
                                    }
                                }
	                        };
                            getSummary(intent,session,response);
                            break;
                        case 'GoToMessageIntent':
                            getSummary(intent,session,response);
                            break;
                        case 'AdvancedModeOnIntent': //this will result in Alexa announcing advanced mode and going on to default behavior
            		        session.attributes.advanced=true;
		                    intent={
                                "name": "ReviewIntent",
                                "slots": {
                                    "fromFilter": {
                                        "name": "fromFilter"
                                    },
                                    "subjectFilter": {
                                      "name": "subjectFilter"
                                    },
                                    "readFilter": {
                                        "name": "readFilter",
                                         "value": "new"
                                    },
                                    "dateFilter": {
                                        "name": "dateFilter"
                                    }
                                }
	                        };
                            getSummary(intent,session,response);
                            break;
                        case 'AdvancedModeOffIntent': //will result in Alexa usual introduction and default behavior
		                    intent={
                                "name": "ReviewIntent",
                                "slots": {
                                    "fromFilter": {
                                        "name": "fromFilter"
                                    },
                                    "subjectFilter": {
                                      "name": "subjectFilter"
                                    },
                                    "readFilter": {
                                        "name": "readFilter",
                                         "value": "new"
                                    },
                                    "dateFilter": {
                                        "name": "dateFilter"
                                    }
                                }
	                        };
                            getSummary(intent,session,response);
                            break; 
                        case 'DetailsIntent':
                            messageDetails(intent, session, response);
                            break;
                        case 'MarkReadIntent':
 	                        modifyMessage(intent, session, response);
             	            break;
                        case 'MarkUnReadIntent':
 	                        modifyMessage(intent, session, response);
             	            break;
                        case 'StarIntent':
             	            modifyMessage(intent, session, response);
 	                        break;
                        case 'UnStarIntent':
 	                        modifyMessage(intent, session, response);
             	            break;
                        case 'DeleteIntent':
                            deleteConfirm (intent, session, response);
                            break;
                        case 'ReplyIntent':
                            replyMessage(intent, session, response);
                            break;
                        case 'ReplyAllIntent':
                            replyMessage(intent, session, response);
                            break;
                        case 'PrintMessageIntent':
                            printStuff(intent, session, response);
                            break;
                        case 'ListAttachmentsIntent':
                            listAttachments(intent, session, response);
                            break;
                        case 'PrintAttachmentsIntent':
                            printStuff(intent, session, response);
                            break;
                        case 'ShowMeIntent':
             	            showmeHandler(intent, session, response);
 	                        break;
                        case 'WaitIntent':
                            makeResponse(session,response,54);
                            break;
                        default: //should not be able to get here, but added to handle unexxpected errors
                            intent={
                                    "name": "ReviewIntent",
                                    "slots": {
                                        "fromFilter": {
                                            "name": "fromFilter"
                                        },
                                        "subjectFilter": {
                                          "name": "subjectFilter"
                                        },
                                        "readFilter": {
                                            "name": "readFilter",
                                             "value": "new"
                                        },
                                        "dateFilter": {
                                            "name": "dateFilter"
                                        }
                                    }
	                            };
                            getSummary(intent,session, response); 
                        }
                        break;
                    default:
        				session.attributes.helpContext=3;
		        		makeResponse(session,response,3);
		            }
		        } catch(e){
				    session.attributes.helpContext=3;
			    	makeResponse(session,response,3);
			    }
		    }
        });
    }
    else {
	//this handles intents during a session, when PIN was already OK.
        switch(intent.name){
            case 'CountIntent':
                getCount(intent, session, response);
                break;
            case 'ReviewIntent':
                getSummary(intent,session,response);    
                break;
            case 'AMAZON.NextIntent':
                getSummary(intent, session, response);
                break;
            case 'AMAZON.PreviousIntent':
 	            getSummary(intent, session, response);
 	            break;
 	        case 'GoToMessageIntent':
 	            getSummary(intent, session, response);
 	            break;
            case 'RefreshIntent': 
                getSummary(intent, session, response);
                break;
            case 'SetPrinterIntent':
                setPrinter(intent, session, response);
                break;
            case 'AMAZON.StartOverIntent':
                intent={
                                "name": "GoToMessageIntent",
                                "slots": {
                                    "messagenumber": {
                                        "name": "messagenumber",
                                         "value": "1"
                                    }
                                }
	                        };
                getSummary(intent,session,response);
                break;
            case 'SetPINIntent':
                setpin(intent,session,response);
                break;
            case 'ClearPINIntent':
                setpin(intent,session,response);
                break;
            case 'AdvancedModeOnIntent':
		        makeResponse(session,response,46);
                  break;
            case 'AdvancedModeOffIntent':
			    makeResponse(session,response,47);
		        break;
	        case 'SayPINIntent':
		        makeResponse(session,response,48);
                break;
            case 'DetailsIntent':
                messageDetails(intent, session, response);
                break;
            case 'MarkReadIntent':
 	            modifyMessage(intent, session, response);
 	            break;
            case 'MarkUnReadIntent':
 	            modifyMessage(intent, session, response);
 	            break;
            case 'StarIntent':
 	            modifyMessage(intent, session, response);
 	            break;
            case 'UnStarIntent':
 	            modifyMessage(intent, session, response);
 	            break;
            case 'DeleteIntent':
                deleteConfirm (intent, session, response);
                break;
            case 'ReplyIntent':
                replyMessage(intent, session, response);
                break;
            case 'ReplyAllIntent':
                replyMessage(intent, session, response);
                break;
            case 'PrintMessageIntent':
                printStuff(intent, session, response);
                break;
            case 'ListAttachmentsIntent':
                listAttachments(intent, session, response);
                break;
            case 'PrintAttachmentsIntent':
                printStuff(intent, session, response);
                break;
            case 'ShowMeIntent':
 	            showmeHandler(intent, session, response);
 	            break;
            case 'WaitIntent':
                makeResponse(session,response,54);
                break;
            default:
                getCount(intent, session, response);
            }
        }
}

function setpin(intent,session,response){
    var mypin="";   
    if(intent.name=='SetPINIntent'){ //user said "set my PIN..."
        if(!intent.slots.mypin.value) { //Alexa did not understand the number
		    session.attributes.helpContext=16;
            makeResponse(session,response,50);
            } else {
                if(intent.slots.mypin.value.length !=4){ //was not a 4-digit number
		            session.attributes.helpContext=16;
                    makeResponse(session,response,50);                    
                } else {mypin=intent.slots.mypin.value;} //spoen PIN is OK
            }
    } else {mypin='notneeded';} //user got here by saying "no" to "set a PIN?" Skill still sets a file to reflect none is needed
    var postData = "{'function':'setpin','parameters':['"+mypin+"']}";
	runScripts (postData, session, function scriptCallback(err,scriptResponse){ //call script to set a PIN file
	    if (err) {
			session.attributes.helpContext=3;
			makeResponse(session,response,3);
	    } else {
	        try {
	            var resp=JSON.parse(scriptResponse);
	            if(resp.response.result){
    		    switch (intent.name){ //make response based on how user got here
        		    case 'SetPINIntent':
        		        if(session.attributes.messageList){session.attributes.helpContext=6;}
        		        else {session.attributes.helpContext=4;}
		                makeResponse(session,response,51,mypin); //confirm user PIN
		                break;
    		        case 'ClearPINIntent':
    		            if(session.attributes.messageList){session.attributes.helpContext=6;}
        		        else {session.attributes.helpContext=4;}
                        makeResponse(session,response,52); //confirm PIN was cleared
		                break;
		            case 'AMAZON.NoIntent': //user got here by saying no when asked about setting a PIN
	                    intent=session.attributes.lastIntent; //recover user's original intent and process that
    		            session.attributes.lastIntent="";
		                switch(intent.name){
                        case 'CountIntent': //user asked How many... (change to default intro behavior)
            		        intent={
                                "name": "ReviewIntent",
                                "slots": {
                                    "fromFilter": {
                                        "name": "fromFilter"
                                    },
                                    "subjectFilter": {
                                    "name": "subjectFilter"
                                    },
                                    "readFilter": {
                                        "name": "readFilter",
                                        "value": "new"
                                    },
                                    "dateFilter": {
                                        "name": "dateFilter"
                                    }
                                }
	                         };
                            getSummary(intent,session,response);
                            break;
                        case 'ReviewIntent':
                            getSummary(intent,session,response);    
                            break;
                        case 'AMAZON.NextIntent':
                            getSummary(intent, session, response);
                            break;
                        case 'AMAZON.PreviousIntent':
             	            getSummary(intent, session, response);
 	                        break;
                        case 'RefreshIntent': //not a valid intent, so go to default behavior
		                    intent={
                                "name": "ReviewIntent",
                                "slots": {
                                    "fromFilter": {
                                        "name": "fromFilter"
                                    },
                                    "subjectFilter": {
                                      "name": "subjectFilter"
                                    },
                                    "readFilter": {
                                        "name": "readFilter",
                                         "value": "new"
                                    },
                                    "dateFilter": {
                                        "name": "dateFilter"
                                    }
                                }
	                        };
                            getSummary(intent,session,response);
                            break;
                        case 'SetPrinterIntent':
                            setPrinter(intent, session, response);
                            break;
                        case 'AMAZON.StartOverIntent': 
            		        intent={
                                "name": "ReviewIntent",
                                "slots": {
                                    "fromFilter": {
                                        "name": "fromFilter"
                                    },
                                    "subjectFilter": {
                                      "name": "subjectFilter"
                                    },
                                    "readFilter": {
                                        "name": "readFilter",
                                         "value": "new"
                                    },  
                                    "dateFilter": {
                                        "name": "dateFilter"
                                    }
                                }
	                        };
                            getSummary(intent,session,response);
                            break;
                        case 'GoToMessageIntent':
                            getSummary(intent,session,response);
                            break;
                        case 'AdvancedModeOnIntent': //this will result in Alexaa announcing advanced mode and going on to default behavior
            		        session.attributes.advanced=true;
		                    intent={
                                "name": "ReviewIntent",
                                "slots": {
                                    "fromFilter": {
                                        "name": "fromFilter"
                                    },
                                    "subjectFilter": {
                                      "name": "subjectFilter"
                                    },
                                    "readFilter": {
                                        "name": "readFilter",
                                         "value": "new"
                                    },
                                    "dateFilter": {
                                        "name": "dateFilter"
                                    }
                                }
	                        };
                            getSummary(intent,session,response);
                            break;
                        case 'AdvancedModeOffIntent': //will result in Alexa usual introduction and default behavior
		                    intent={
                                "name": "ReviewIntent",
                                "slots": {
                                    "fromFilter": {
                                        "name": "fromFilter"
                                    },
                                    "subjectFilter": {
                                      "name": "subjectFilter"
                                    },
                                    "readFilter": {
                                        "name": "readFilter",
                                         "value": "new"
                                    },
                                    "dateFilter": {
                                        "name": "dateFilter"
                                    }
                                }
	                        };
                            getSummary(intent,session,response);
                            break; 
                        case 'DetailsIntent':
                            messageDetails(intent, session, response);
                            break;
                        case 'MarkReadIntent':
 	                        modifyMessage(intent, session, response);
             	            break;
                        case 'MarkUnReadIntent':
 	                        modifyMessage(intent, session, response);
             	            break;
                        case 'StarIntent':
             	            modifyMessage(intent, session, response);
 	                        break;
                        case 'UnStarIntent':
 	                        modifyMessage(intent, session, response);
             	            break;
                        case 'DeleteIntent':
                            deleteConfirm (intent, session, response);
                            break;
                        case 'ReplyIntent':
                            replyMessage(intent, session, response);
                            break;
                        case 'ReplyAllIntent':
                            replyMessage(intent, session, response);
                            break;
                        case 'PrintMessageIntent':
                            printStuff(intent, session, response);
                            break;
                        case 'ListAttachmentsIntent':
                            listAttachments(intent, session, response);
                            break;
                        case 'PrintAttachmentsIntent':
                            printStuff(intent, session, response);
                            break;
                        case 'ShowMeIntent':
             	            showmeHandler(intent, session, response);
 	                        break;
                        case 'WaitIntent':
                            makeResponse(session,response,54);
                            break;
                        default: //should not be able to get here, but added to handle unexxpected errors
                            intent={
                                    "name": "ReviewIntent",
                                    "slots": {
                                        "fromFilter": {
                                            "name": "fromFilter"
                                        },
                                        "subjectFilter": {
                                          "name": "subjectFilter"
                                        },
                                        "readFilter": {
                                            "name": "readFilter",
                                             "value": "new"
                                        },
                                        "dateFilter": {
                                            "name": "dateFilter"
                                        }
                                    }
	                            };
                            getSummary(intent,session, response); 
                        }
	                }
	            } else {
	                session.attributes.helpContext=3;
			    	makeResponse(session,response,3);
	            }
	        } catch(e) {
	            session.attributes.helpContext=3;
			    makeResponse(session,response,3);
			}
	   }
    });
}

//craft the response for the Alexa speech and/or card
function makeResponse(session,response,context,param1,param2){
	var speechText="";
	session.attributes.question="";
	var speechOutput,repromptText,repromptOutput,cardTitle,cardText,tmpSpeech;
	var speakindex,msg,printers,i, attachments,imageurl;
    if(session.attributes.advanced){ //speech for advanced mode
	    if(!session.attributes.started){
		    speechText="You opened this skill in advanced mode.  If you change your mind and want more coaching, just say turn advanced mode off. ";
		    session.attributes.started=true;
	    }	
	    	    switch(context){
		case 1:
			speechOutput="I am having trouble interpreting your search request. Please try again.";
			if(!session.attributes.messageList){
			repromptText="<speak><p>You can say things like check my email, help, or say quit to exit.</p>  What would you like to do?</speak>";
			} else {
			repromptText="<speak><p>You can try a different search, say next message to go back to what you were doing, say help, or say quit to exit.</p>  What would you like to do?</speak>";
			}
			repromptOutput={speech:repromptText,type:'SSML'};
			break;
		case 2:
			speechOutput="Please open the Alexa app to reconnect your google account, and then try this skill again. Goodbye.";
			response.tellWithLinkAccount(speechOutput);
			break;
		case 3:
			speechOutput="I'm having trouble reaching Google to process your request.";
			repromptOutput="You can say things like check my email, help or say wait, for more time.  What would you like to do?";
			break;
		case 4:
			session.attributes.question=1;
			if(session.attributes.tmpmessageList.resultSizeEstimate==1){
				speechOutput=speechText+"I found one"+session.attributes.tmpreadFilter+" message"+session.attributes.tmpsearchString+". would you like to review it?";
				repromptOutput="You can say yes to start at the first message I just found, or say no to go back to the previous list.  Would you like to review the message I found?";
			} else {
				speechOutput=speechText+"I found "+session.attributes.tmpmessageList.resultSizeEstimate+" "+session.attributes.tmpreadFilter+" messages"+session.attributes.tmpsearchString+". would you like to review them?";
				repromptOutput="You can say yes to start at the first message I just found, or say no to go back to the previous list.  Would you like to review the messages I found?";
			}
			break;
		case 5:
			speechText="<speak><p>"+speechText+"</p>I didn't find any" + param1 + " messages"+param2+".</speak>";
			speechOutput={speech:speechText,type:'SSML'};
			repromptOutput="You can try another search, or say things like review all my messages, help, or say wait, for more time.  What would you like to do?";
			break;
		case 6:
			if(session.attributes.messageList.resultSizeEstimate==1){
				speechText="<speak><p>"+speechText+"</p><p>You have one"+session.attributes.readFilter+" message"+session.attributes.searchString+".</p></speak>";
			} else {
				speechText="<speak><p>"+speechText+"</p><p>You have "+session.attributes.messageList.resultSizeEstimate+" "+session.attributes.readFilter+" messages"+session.attributes.searchString+".</p></speak>";
			}
			speechOutput={speech:speechText,type:'SSML'};
			repromptOutput="You can say say things like next message, help, or say wait, for more time.  What would you like to do?";
			break;
		case 7:
			speechText="<speak><p>"+speechText+"</p><p>I think you asked me to do something with a message, but first I need to get a list of your messages.</p><p> You can say things like check my email, review all my messages, or help.</p>  What would you like to do?</speak>";
			speechOutput={speech:speechText,type:'SSML'};
			repromptOutput="You can say things like check my email.";
			break;
		case 8:
		    if(session.attributes.messageList.resultSizeEstimate==1){
			speechText="<speak><p>"+speechText+"</p><p>You have one"+session.attributes.readFilter+" message"+session.attributes.searchString+"</p>";
			} else {
				speechText="<speak><p>"+speechText+"</p><p>You have "+session.attributes.messageList.resultSizeEstimate+" "+session.attributes.readFilter+" messages"+session.attributes.searchString+"</p>";
			}
			speakindex=session.attributes.messageIndex+1;
			msg=session.attributes.currentMessage;
		    speechText = speechText+"<p>  Message: " + speakindex + ". From "+msg.from+". Received: "+msg.date+". Subject: "+msg.subject+".</p></speak>";
		    speechOutput={speech:speechText,type:'SSML'};
		    repromptText="<speak><p>You can say help for more choices, say wait, for more time, or say quit to exit.</p>  What would you like to do?</speak>";
		    repromptOutput={speech:repromptText,type:'SSML'};
            break;
        case 9:
            speakindex=session.attributes.messageIndex+1;
		msg=session.attributes.currentMessage;
		    speechText = "<speak><p>Message: " + speakindex + ". From: "+msg.from+". Received: "+msg.date+". Subject: "+msg.subject+".</p></speak>";
		    repromptText="<speak><p>You can say help for more choices, say wait for more time, or say quit to exit.</p>  What would you like to do?</speak>";
		    speechOutput={speech:speechText,type:'SSML'};
		    repromptOutput={speech:repromptText,type:'SSML'};
            break;
	    case 10:
	        switch(param1){
            case 'reachedend':
                speechOutput="You have reached the last message on this list.";
		   	    break;
	   	    case 'reachedfirst':
        	    speechOutput="You have reached the first message on this list.";
			    break;
		    case 'outofbounds':
			    speechOutput="I think you were trying to go to a specific message, but I can't find the one you are looking for.  Please say go to message, and then a number between 1 and "+session.attributes.messageList.resultSizeEstimate+", or ask me to do something else.";
	        }
	        repromptOutput={speech:"<speak><p>You can say things like get all my messages, help or say quit to exit.</p> What would you like to do next?</speak>",type:'SSML'};
	        break;
	    case 11:
	        speechText="<speak><p>Here's your message: </p><p>"+param1+"</p><p> That's the end of the message.</p><p>  You can say things like print this, next message, or help.</p>What would you like to do?</speak>";
            speechOutput={speech:speechText,type:'SSML'};
            repromptOutput="You can say things like print this, next message, help or say wait, for more time. What would you like to do?";
            session.attributes.lastSpeech=param1+"  That's the end of the message.  You can say things like print this, next message, or help. What would you like to do?";
            response.ask(speechOutput,repromptOutput);
            break;
        case 12:
            switch(param1){
                case "MarkReadIntent": 
                    speechOutput="OK.  I marked that message as read.";
                    break;
                case "MarkUnReadIntent":
                    speechOutput="OK.  I marked that message as unread.";
                    break;
                case "StarIntent":
                    speechOutput="OK.  I marked that message as starred.";
                    break;
                case "UnStarIntent":
                    speechOutput="OK.  I removed the star from that message.";
                break;        
                case "AMAZON.YesIntent":
                speechOutput="OK.  I moved that message to your trash folder.  To stop hearing it on your list you can say refresh.";
            }
            repromptOutput="You can say things like print this, next message, help, or say wait, for more time. What would you like to do?";
            break;
        case 13:
            speechText="<speak><p>If you are trying to reply, say reply, to answer only the sender, or reply all, to answer everyone on this message, followed by a short, 1 sentence message.</p><p>You can say something like, reply all, I'll see you then.</p> What would you like to do next?</speak>";
            speechOutput={speech:speechText,type:'SSML'};
            repromptOutput="You can try again to reply, or say things like next message, help, or say wait, for more time. What would you like to do?";
            break;
        case 14:
	    session.attributes.question=2;
            if(session.attributes.lastIntent.name=='ReplyIntent'){
                speechOutput="I think you asked me to reply to "+session.attributes.currentMessage.from+", saying, "+param1+". Would you like me to send this?";
            } else {
                speechOutput="I think you asked me to reply to everyone copied on this message, saying, "+param1+". Would you like me to send this?";
            }
            repromptOutput="You can say yes to send this message, say no to cancel or correct it, or say help.  Should I send the meessage?";
            break;
        case 15:
            speechOutput="OK.  I sent your message.";
            repromptOutput="You can say things like next message, help, or say wait, for more time. What would you like to do?";
            break;
        case 16:
            speechOutput=speechText+"I think you are trying to choose a printer, but I am not sure which one.  You can say something like choose printer 1, say another command, or say help for more options.  What would you like to do?";
            repromptOutput="You can say something like choose printer 1, help, or say wait, for more time.  What would you like to do?";
            break;
        case 17:
            speechOutput=speechText+"I can't find any online printers. Please check your printer and try again.";
		if(session.attributes.messageList){
            repromptOutput="You can say things like next message, help, or say wait for more time.  What would you like to do?";
		} else {repromptOutput="You can say things like review my messages, help, or say wait, for more time.  What would you like to do?";}
            break;
        case 18:
            speechOutput="I set your printer to "+ session.attributes.printers[param1][1]+".";
            if(session.attributes.messageList){
            repromptOutput="You can say things like print this, next message, help, or say wait, for more time.  What would you like to do?";
            } else {
                repromptOutput="You can say things like review my messages, help, or say wait, for more time.  What would you like to do?";
            }
            break;
        case 19:
            printers = session.attributes.printers;
            speechText="<speak><p>"+speechText+"</p><p>I found "+printers.length+" online printers.</p>";
			for(i=1;i<printers.length+1;++i){  //i is user speech not array index.  index = i-1.
			    speechText=speechText+"<p> Say printer "+i+" to use printer "+printers[i-1][1]+".</p> ";
			}
		speechText = speechText+" What would you like to do?</speak>";
		speechOutput={speech:speechText,type:'SSML'};
		repromptOutput="You can say repeat that to hear the choices again, say help, or say wait, for more time.  What would you like to do?";
		break;
	case 20: //confirm print message
		session.attributes.question=3;
		speechOutput="I think you asked to send the message, which is about "+param1;
		if(param1==1){speechOutput=speechOutput+" page";}
		else {speechOutput=speechOutput+" pages";}
		speechOutput=speechOutput+" to the printer, "+session.attributes.printers[session.attributes.selectedPrinter-1][1]+". Do you want to do this?";
		repromptOutput="You can say yes to print this message, say no to cancel, say help, or say wait, for more time.  Would you like to continue printing?";
		break;
	case 21: //confirm print attachment
		session.attributes.question=3;
		speechOutput="I think you asked me print "+session.attributes.attachments[param1][0]+", which will send about "+param2;
		if(param2==1){speechOutput=speechOutput+" page";}
		else {speechOutput=speechOutput+" pages";}
		speechOutput=speechOutput+" to the printer, "+session.attributes.printers[session.attributes.selectedPrinter-1][1]+". Do you want to do this?";
		repromptOutput="You can say yes to print the attachment, say no to cancel, say help for more options, or say wait, for more time.  Would you like to continue printing?";
		break;    
	case 22: //requested print attachment but they have not been fetched
		speechOutput="I think you are trying to print an attachment, but I need to fetch the attachments first.  You can say list attachments to hear the choices for this message.";
		repromptOutput="You can say things like list the attachments, next message, help, or say wait, for more time.  What would you like to do?";
		break;
	case 23: //trying to print attachment but msg has no attachments
		speechOutput="I think you are trying to print an attachment, but I can't find any attachments to this message.";
		repromptOutput="You can say things like next message, help, or say wait, for more time.  What would you like to do?";
		break;
	case 24: //not sure which attachment to be printed (empty or out of bounds slot value)
		speechOutput="I think you are trying to print an attachment, but I didn't understand which one.  This message has ";
		if(session.attributes.attachments.length==1){speechOutput=speechOutput+"one attachment. "}
		else{speechOutput=speechOutput+session.attributes.attachments.length+" attachments.";}
		repromptOutput="You can say things like print attachment 1, next message, help, or say wait, for more time.  What would you like to do?";
		break;
	case 25: //confirm print
		speechOutput="OK.  I sent that to the printer.";
		repromptOutput="You can say things like next message, help, or say wait, for more time.  What would you like to do?";
		break;
	case 26: //some attachments were returned.  Read if one, ask if more.
		attachments = session.attributes.attachments;
		if(attachments.length>1){
				speechOutput = "This message has "+attachments.length+" attachments.  Would you like me to list them?";
            			session.attributes.question=6;
            			session.attributes.helpContext=14;
				repromptOutput="You can say yes to hear the attachments, say help, or say wait, for more time. Should I list the attachments?";
				    }
		if(attachments.length==1){
			 speechOutput = "This message has one attachment.  It is "+attachments[0][0]+" named "+attachments[0][1]+".";
            		  speechOutput =speechOutput +"  You can say things like print attachment one, next message, or say help for more options. What would you like to do?";
			repromptOutput="You can say things like repeat that, help, or say wait, for more time. What woud you like to do?";
			}
		
		break;
	case 27: //user said yes to hear the attachment list
		    speechOutput="Here are the attachments.  To interrupt me, you can say Alexa, followed by a command.";
		    for (i=1;i<=session.attributes.attachments.length;++i){
            		speechOutput=speechOutput+"Attachment "+i+" is "+session.attributes.attachments[i-1][0]+" named "+session.attributes.attachments[i-1][1]+". ";
		    }
		    repromptOutput="You can say things like repeat that, help, or say wait, for more time. What would you like to do?";
		    break;
	case 28: //cancel handler
		    session.attributes.question=4;
		    if(session.attributes.messageList){session.attributes.helpContext=2;}
		    else {session.attributes.helpContext=1;}
		    speechOutput="Would you like to quit?";
		    repromptOutput="You can say yes to quit, say no to continue, say help, or say wait, for more time.  Would you like to quit?";
		    break;
	case 29: //repeatHandler    		
    		if(session.attributes.lastSpeech){speechOutput=session.attributes.lastSpeech;}
		    else {speechOutput="I'm sorry.  I don't have any speech available to repeat.";}
		    repromptOutput="You can say help, say quit to exit, or say wait, for more time. What would you like to do?";
		    break;
	case 30: //delete confirm
		    speechOutput="Did you ask me to move this message to the trash folder?";
		    repromptOutput="You can say yes to erase this message, say no, or say help for more information.  Do you want to erase this message?";
            session.attributes.question=5;
        	break;
	case 31: //reserved;
		    break;
	case 32: //user said yes to "set a pin?"
		    speechOutput="To set an access pin, say set my pin, followed by a 4 digit number.  For example, you can say set my pin to 1 2 3 4.  What would you like to do?";
		    repromptOutput="If you don't want to decide on a PIN now, I will ask you again next time. You can say things like check my email, help, or say wait, for more time.  What would you like to do?";
		    break;
	case 33: //said no the question - list attachments?
	    session.attributes.helpContext=6;
		speechOutput="OK.";
		repromptOutput="You can say things like next message, help or say wait, for more time.  What would you like to do?";
		break;
	case 34: //no question asked.
	    if(session.attributes.messageList){session.attributes.helpContext=6;}
		else {session.attributes.helpContext=4;}
		speechOutput = "Sorry, I don't think I asked a yes or no question.";
		if(session.attributes.messageList){
			repromptOutput="You can say things like next message, read more, help or say quit if you're finished.  What would you like to do?";}
		else {repromptOutput="You can say things check my email, help or say quit if you're finished.  What would you like to do?";}
		break;
	case 35: //said no to prompted action (delete, reply, trash)
	    session.attributes.helpContext=6;
		speechOutput="OK. I cancelled that.";
		repromptOutput="You can say things like next message, help or say wait, for more time.  What would you like to do?";
		break;
	case 36: //reserved
		break;
	case 37: //user said print/show me attachment on a message with no attachments.
	    speechOutput="This message has no attachments.";
	    repromptOutput="You can say things like next message, help, or say wait, for more time.  What would you like to do?";
    	break;
	case 38: //User said show me but atatchments are not JPG or PNG images
	    if(session.attributes.attachments.length==1){
	        speechOutput="This message has one attachment, but it is not an image that I can send to the Alexa app.";
	    } else {
		speechOutput="This message has "+session.attributes.attachments.length+" attachments, but none of them are images that I can send to the Alexa app.";}
		repromptOutput="You can say things like next message, help, or say wait, for more time.  What would you like to do?";
		break;
	case 39: //user said show me an attachment that was not an image but some others are
	    speechOutput="This message has "+session.attributes.attachments.length+" attachments. ";
	    if(param1.length==1){speechOutput=speechOutput+" I can only show you Attachment "+param1[0];}
	    else {
	        speechOutput=speechOutput+" I can show you ";
	        for (i=0;i<param1.length-1;++i){
	            speechOutput=speechOutput+"attachment "+param1[i]+", ";
	        }
	        i=param1.length-1;
	        speechOutput=speechOutput+" or attachment "+param1[i];
	    }
	    repromptOutput="You can say things like show me attachment "+param1[0]+", print attachment one, next message, help, or say wait, for more time.  What would you like to do?";
	    break;
    case 40: //OK sent image to app
            speechOutput="OK.  I sent that to the Alexa app.";
            repromptOutput="You can say things like next message, help, or say wait, for more time.  What would you like to do?";
			 cardTitle="Image Attached to your message from "+session.attributes.currentMessage.from;
			 cardText="File name: "+session.attributes.attachments[param1][1];
			 response.askWithImageCard (speechOutput, repromptOutput, cardTitle, cardText,param2);
		    break;
    case 41: //OK sent last speech to app
            speechOutput="OK.  I sent that to the Alexa app.";
            repromptOutput="You can say things like next message, help, or say wait, for more time.  What would you like to do?";
			cardTitle="Last Thing Said by the My Email Skill:";
			cardText="";
			tmpSpeech=session.attributes.lastSpeech;
			if(typeof tmpSpeech=='object'){
			    cardText=tmpSpeech.speech.replace(/<[^>]*>/g, "");
			} else {cardText=tmpSpeech;}
			response.askWithCard (speechOutput, repromptOutput, cardTitle, cardText);
			break;
	case 42: //user said "my PIN is..without a number or one not 4 digits
		speechOutput=speechText+"I think you were trying to speak an access PIN but I didn't understand the number.  Please say your four-digit number.  If you were not trying to say a PIN, try your request again.  What would you like to do?";
		repromptOutput="You can say your PIN, say help, say quit to exit, or say wait, for more time.  What is your four-digit PIN?";
		break;
	case 43: //user with a PIN set, opened skill without saying their PIN.
		speechOutput=speechText+"First, what's your four-digit access PIN?";
		repromptOutput="You can say your PIN, say help, say quit to exit, or say wait, for more time.  What is your four-digit PIN?";
		break;
	case 44: //user spoke incorrect PIN
		speechOutput = {speech:"<speak><p>"+speechText+"</p>Sorry. <say-as interpret-as=\"digits\">"+param1+"</say-as> is not the correct access PIN.  Please say your PIN again.</speak>",type: 'SSML'};
		repromptOutput="You can say your PIN, say help, say quit to exit, or say wait, for more time.  What is your four-digit PIN?";
		break;
	case 45: //user has no PIN, first use only prompts asking about setting one.
	    session.attributes.question=7;
		speechOutput=speechText+"If you would like to prevent others from reading your email using this Alexa device, you can set a 4 digit access pin.  You would need to remember this pin to access your email with Alexa.  Would you like to set a PIN now?";
		repromptOutput="If you say yes, I'll help you set a PIN.  If you say no, I won't ask again, but you can set a PIN any time by saying set my PIN.  Do you want to set a PIN now?";
		break;
	case 46: //user turned on advanced mode
		if(speechText){speechOutput=speechText;}
		else {speechOutput="Advanced mode is on.  If you change your mind, just say turn off advanced mode.  What's next?";}	
		repromptOutput="You can say things like review my messages, turn advanced mode off, help, or say wait, for more time.  What would you like to do?"; 
		break;
	case 47: //user turned off advanced mode
		if(speechText){speechOutput=speechText;}
		else {speechOutput="Advanced mode is off.  If you change your mind, just say turn on advanced mode.  What's next?";}	
		repromptOutput="You can say things like review my messages, turn advanced mode on, help, or say wait, for more time.  What would you like to do?"; 
		break;
	case 48: //user said a PIN when it was already accepted
		speechOutput="I think you were trying to speak your access PIN, but the PIN had already been accepted.";
		repromptOutput="You can say things like review my messages, help, or say wait, for more time.  What would you like to do?"; 
		break;
	case 50: //user tried to set PIN but slot was empty or not 4 digits
	    if(session.attributes.messageList){session.attributes.helpContext=6;}
	    else {session.attributes.helpContext=4;}
		speechOutput=speechText+"I think you were trying to reset your access PIN but I didn't understand the new number.";
		repromptOutput="You can say things like review my messages,say help, for more options, or say wait, for more time.  What would you like to do?"; 
		break;
	case 51: //confirm successful PIN set
	    if(session.attributes.messageList){session.attributes.helpContext=6;}
	    else {session.attributes.helpContext=4;}
		speechText="<speak><p>OK.</p><p>I reset your access PIN to <say-as interpret-as=\"digits\">"+param1+"</say-as></p><p> You will need this new number to access this skill in the future.</p></speak>";
		speechOutput={speech:speechText,type:'SSML'};
		repromptOutput="You can say things like review my messages, help, or say wait, for more time.  What would you like to do?"; 
		break;
	case 52: //OK PIN cleared.
	    if(session.attributes.messageList){session.attributes.helpContext=6;}
	    else {session.attributes.helpContext=4;}
	    speechOutput="OK. Anyone using this Alexa device can now access the email skill without a PIN.";
	    repromptOutput="You can say things like review my messages, help, or say wait, for more time.  What would you like to do?"; 
	    break;
	case 53: //wrong PIN lockout
	    speechText="<speak><p>I'm sorry. </p><p>This account has been temporarily locked after too many incorrect PIN attempts.</p>I sent PIN reset instructions to the Alexa app.</speak>";
	    speechOutput={speech:speechText,type:'SSML'};
	    cardTitle="My Email Skill is Locked";
	    cardText="To reset your PIN, use a browser to visit\r\n http://email-skill.blogspot.com/p/pin-reset.html";
	    response.tellWithCard (speechOutput, cardTitle, cardText);
	    break;
	case 54:
	    speechOutput="OK. I'll wait.";
        repromptOutput="You can say help, say quit to exit, or say wait again, for more time.  What would you like to do?";
	    }
    } else { //speech for not advanced mode
	    if(!session.attributes.started&&context!=34){
		    speechText="Welcome to the my email skill.  ";
		    session.attributes.started=true;
	    }
	    switch(context){
		case 1:
			speechText="<speak><p>"+speechText+"</p><p>I'm having trouble with your search request.  If you're searching for recent messages, I can't use a time period smaller than one day.</p><p> Please try your search again, or you can say help for more choices or say quit if you're finished.</p>  What would you like to do?</speak>";
			if(!session.attributes.messageList){
			repromptText="<speak><p>You can say things like check my email, help, or say quit to exit.</p>  What would you like to do?</speak>";
			} else {
			repromptText="<speak><p>You can try a different search, say next message to go back to what you were doing, say help, or say quit to exit.</p>  What would you like to do?</speak>";
			}
			speechOutput={speech:speechText,type:'SSML'};
			repromptOutput={speech:repromptText,type:'SSML'};
			break;
		case 2:
			speechOutput="Please open the Alexa app to reconnect your google account, and then try this skill again. Goodbye.";
			
			response.tellWithLinkAccount(speechOutput);
			break;
		case 3:
			speechText="<speak><p>"+speechText+"</p><p>I'm having trouble reaching Google to process your request.</p>You can try again, say help, or say quit if you're finished. What would you like to do?</speak>";
			speechOutput={speech:speechText,type:'SSML'};
			repromptOutput="You can say things like check my email, help or say wait, for more time.  What would you like to do?";
			break;
		case 4:
			session.attributes.question=1;
			if(session.attributes.tmpmessageList.resultSizeEstimate==1){
				speechOutput=speechText+"I found one"+session.attributes.tmpreadFilter+" message"+session.attributes.tmpsearchString+". would you like to review it?";
				repromptOutput="You can say yes to start at the first message I just found, or say no to go back to the previous list.  Would you like to review the message I found?";
			} else {
				speechOutput=speechText+"I found "+session.attributes.tmpmessageList.resultSizeEstimate+" "+session.attributes.tmpreadFilter+" messages"+session.attributes.tmpsearchString+". would you like to review them?";
				repromptOutput="You can say yes to start at the first message I just found, or say no to go back to the previous list.  Would you like to review the messages I found?";
			}
			break;
		case 5:
			speechText="<speak><p>"+speechText+"</p><p>I didn't find any" + param1 + " messages"+param2+".</p><p> You can say things like review all my messages, or say help for more choices.</p>  What would you like to do?</speak>";
			speechOutput={speech:speechText,type:'SSML'};
			repromptOutput="You can try another search, or say things like review all my messages, help, or say wait, for more time.  What would you like to do?";
			break;
		case 6:
			if(session.attributes.messageList.resultSizeEstimate==1){
				speechText="<speak><p>"+speechText+"</p><p>You have one"+session.attributes.readFilter+" message"+session.attributes.searchString+".</p>";
			} else {
				speechText="<speak><p>"+speechText+"</p><p>You have "+session.attributes.messageList.resultSizeEstimate+" "+session.attributes.readFilter+" messages"+session.attributes.searchString+".</p>";
			}
			speechText=speechText+"<p> You can say things like read more, print this, next, or help.</p>  What would you like to do?</speak>";
			speechOutput={speech:speechText,type:'SSML'};
			repromptOutput="You can say say things like next message, help, or say wait, for more time.  What would you like to do?";
			break;
		case 7:
			speechText="<speak><p>"+speechText+"</p><p>I think you asked me to do something with a message, but firsts I need to get a list of your messages.</p><p> You can say things like check my email, review all my messages, or help.</p>  What would you like to do?</speak>";
			speechOutput={speech:speechText,type:'SSML'};
			repromptOutput="You can say things like check my email, review all my messages, help, or say wait, for more time.  What would you like to do?";
			break;
		case 8:
		    if(session.attributes.messageList.resultSizeEstimate==1){
			speechText="<speak><p>"+speechText+"</p><p>You have one"+session.attributes.readFilter+" message"+session.attributes.searchString+"</p>";
			} else {
				speechText="<speak><p>"+speechText+"</p><p>You have "+session.attributes.messageList.resultSizeEstimate+" "+session.attributes.readFilter+" messages"+session.attributes.searchString+"</p>";
			}
			speakindex=session.attributes.messageIndex+1;
			msg=session.attributes.currentMessage;
		    speechText = speechText+"<p>  Message: " + speakindex + ". From "+msg.from+". Received: "+msg.date+". Subject: "+msg.subject+".</p>";
		    speechText=speechText+"<p> You can say things like read more, next, erase, or say help for more options.</p>  What would you like to do?</speak>";
		    speechOutput={speech:speechText,type:'SSML'};
		    repromptText="<speak><p>You can say help for more choices, say wait, for more time, or say quit to exit.</p>  What would you like to do?</speak>";
		    repromptOutput={speech:repromptText,type:'SSML'};
            break;
        case 9:
            speakindex=session.attributes.messageIndex+1;
		msg=session.attributes.currentMessage;
		    speechText = "<speak><p>Message: " + speakindex + ". From: "+msg.from+". Received: "+msg.date+". Subject: "+msg.subject+".</p>";
		    speechText=speechText+"<p> You can say things like read more, next, erase, or say help for more options. </p>  What would you like to do?</speak>";
		    repromptText="<speak><p>You can say help for more choices, say wait for more time, or say quit to exit.</p>  What would you like to do?</speak>";
		    speechOutput={speech:speechText,type:'SSML'};
		    repromptOutput={speech:repromptText,type:'SSML'};
            break;
	    case 10:
	        switch(param1){
            case 'reachedend':
                speechText="You have reached the last message on this list.";
		   	    break;
	   	    case 'reachedfirst':
        	    speechText="You have reached the first message on this list.";
			    break;
		    case 'outofbounds':
			    speechText="I think you were trying to go to a specific message, but I can't find the one you are looking for.  Please say go to message, and then a number between 1 and "+session.attributes.messageList.resultSizeEstimate+", or ask me to do something else.";
		        break;
	        }
	        speechText="<speak><p>"+speechText+"</p><p> You can say things like get all my messages, help or say quit if you're finished.</p> What would you like to do next?</speak>";
	        speechOutput={speech:speechText,type:'SSML'};
	        repromptOutput={speech:"<speak><p>You can say things like get all my messages, help or say quit to exit.</p> What would you like to do next?</speak>",type:'SSML'};
	        break;
	    case 11:
	        speechText="<speak><p>I'll try to read the message to you, but some messages are not designed to be read aloud.</p><p>  If it doesn't sound right, you can print it, or say show me to view it in the Alexa App.</p>Here's your message: <p>";
	        speechText=speechText+param1+"</p><p> That's the end of the message.  You can say things like print this, next message, or help.</p>What would you like to do?</speak>";
            speechOutput={speech:speechText,type:'SSML'};
            repromptOutput="You can say things like print this, next message, help or say wait, for more time. What would you like to do?";
            session.attributes.lastSpeech=param1+"  That's the end of the message.  You can say things like print this, next message, or help. What would you like to do?";
            response.ask(speechOutput,repromptOutput);
            break;
        case 12:
            switch(param1){
                case "MarkReadIntent": 
                    speechText="OK.  I marked that message as read.";
                    break;
                case "MarkUnReadIntent":
                    speechText="OK.  I marked that message as unread.";
                    break;
                case "StarIntent":
                    speechText="OK.  I marked that message as starred.";
                    break;
                case "UnStarIntent":
                    speechText="OK.  I removed the star from that message.";
                break;        
                case "AMAZON.YesIntent":
                speechText="OK.  I moved that message to your trash folder.  To stop hearing it on your list you can say refresh.";
            }
            speechText="<speak><p>"+speechText+"</p><p>  You can say things like print this, next message, or help.</p>What would you like to do?</speak>";
            speechOutput={speech:speechText,type:'SSML'};
            repromptOutput="You can say things like print this, next message, help, or say wait, for more time. What would you like to do?";
            break;
        case 13:
            speechText="<speak><p>If you are trying to reply, say reply, to answer only the sender, or reply all, to answer everyone on this message, followed by a short, 1 sentence message.</p><p>You can say something like, reply all, I'll see you then.</p> What would you like to do next?</speak>";
            speechOutput={speech:speechText,type:'SSML'};
            repromptOutput="You can try again to reply, or say things like next message, help, or say wait, for more time. What would you like to do?";
            break;
        case 14:
	    session.attributes.question=2;
            if(session.attributes.lastIntent.name=='ReplyIntent'){
                speechOutput="I think you asked me to reply to "+session.attributes.currentMessage.from+", saying, "+param1+". Would you like me to send this?";
            } else {
                speechOutput="I think you asked me to reply to everyone copied on this message, saying, "+param1+". Would you like me to send this?";
            }
            repromptOutput="You can say yes to send this message, say no to cancel or correct it, or say help.  Should I send the meessage?";
            break;
        case 15:
            speechOutput="OK.  I sent your message.  You can say things like next message, erase this, or help. What would you like to do?";
            repromptOutput="You can say things like next message, help, or say wait, for more time. What would you like to do?";
            break;
        case 16:
            speechOutput=speechText+"I think you are trying to choose a printer, but I am not sure which one.  You can say something like choose printer 1, say another command, or say help for more options.  What would you like to do?";
            repromptOutput="You can say something like choose printer 1, help, or say wait, for more time.  What would you like to do?";
            break;
        case 17:
            speechOutput=speechText+"I can't find any online printers. Please check your printer and try again, or you can say another command, or say help.  What would you like to do?";
		if(session.attributes.messageList){
            repromptOutput="You can say things like next message, help, or say wait for more time.  What would you like to do?";
		} else {repromptOutput="You can say things like review my messages, help, or say wait, for more time.  What would you like to do?";}
            break;
        case 18:
            if(session.attributes.messageList){
            speechOutput="I set your printer to "+ session.attributes.printers[param1][1]+".  To print, you can say things like print this message or print attachment 1.  You can also say other commands or say help.  What would you like to do?";
            repromptOutput="You can say things like print this, next message, help, or say wait, for more time.  What would you like to do?";
            } else {
                speechOutput=speechText+"I set your printer to "+ session.attributes.printers[param1][1]+".  To print, you will need to retrieve some messages.  You can say things like review my messages, or help.  What would you like to do?";
                repromptOutput="You can say things like review my messages, help, or say wait, for more time.  What would you like to do?";
            }
            break;
        case 19:
            printers = session.attributes.printers;
            speechText="<speak><p>"+speechText+"</p><p>I found "+printers.length+" online printers.</p>";
			for(i=1;i<printers.length+1;++i){  //i is user speech not array index.  index = i-1.
			    speechText=speechText+"<p> Say printer "+i+" to use printer "+printers[i-1][1]+".</p> ";
			}
		speechText = speechText+" What would you like to do?</speak>";
		speechOutput={speech:speechText,type:'SSML'};
		repromptOutput="You can say repeat that to hear the choices again, say help, or say wait, for more time.  What would you like to do?";
		break;
	case 20: //confirm print message
		session.attributes.question=3;
		speechOutput="I think you asked to send the message, which is about "+param1;
		if(param1==1){speechOutput=speechOutput+" page";}
		else {speechOutput=speechOutput+" pages";}
		speechOutput=speechOutput+" to the printer, "+session.attributes.printers[session.attributes.selectedPrinter-1][1]+". Do you want to do this?";
		repromptOutput="You can say yes to print this message, say no to cancel, say help, or say wait, for more time.  Would you like to continue printing?";
		break;
	case 21: //confirm print attachment
		session.attributes.question=3;
		speechOutput="I think you asked me print "+session.attributes.attachments[param1][0]+", which will send about "+param2;
		if(param2==1){speechOutput=speechOutput+" page";}
		else {speechOutput=speechOutput+" pages";}
		speechOutput=speechOutput+" to the printer, "+session.attributes.printers[session.attributes.selectedPrinter-1][1]+". Do you want to do this?";
		repromptOutput="You can say yes to print the attachment, say no to cancel, say help for more options, or say wait, for more time.  Would you like to continue printing?";
		break;    
	case 22: //requested print attachment but they have not been fetched
		speechOutput="I think you are trying to print an attachment, but I need to fetch the attachments first.  You can say list attachments to hear the choices for this message, say another command, or say help for more choices. What would you like to do?";
		repromptOutput="You can say things like list the attachments, next message, help, or say wait, for more time.  What would you like to do?";
		break;
	case 23: //trying to print attachment but msg has no attachments
		speechOutput="I think you are trying to print an attachment, but I can't find any attachments to this message. You can say things like print the message, next message, or say help for more choices. What would you like to do?";
		repromptOutput="You can say things like next message, help, or say wait, for more time.  What would you like to do?";
		break;
	case 24: //not sure which attachment to be printed (empty or out of bounds slot value)
		speechOutput="I think you are trying to print an attachment, but I didn't understand which one.  This message has ";
		if(session.attributes.attachments.length==1){speechOutput=speechOutput+"one attachment.";}
		else{speechOutput=speechOutput+session.attributes.attachments.length+" attachments.";}
		speechOutput=speechOutput+"You can say something like print attachment one, list attachments, or say help.  What would you like to do?";
		repromptOutput="You can say things like print attachment 1, next message, help, or say wait, for more time.  What would you like to do?";
		break;
	case 25: //confirm print
		speechOutput="OK.  I sent that to the printer.  You can say things like next message, or help. What would you like to do?";
		repromptOutput="You can say things like next message, help, or say wait, for more time.  What would you like to do?";
		break;
	case 26: //some attachments were returned.  Read if one, ask if more.
		attachments = session.attributes.attachments;
		if(attachments.length>1){
				speechOutput = "This message has "+attachments.length+" attachments.  Would you like me to list them?";
            			session.attributes.question=6;
            			session.attributes.helpContext=14;
				repromptOutput="You can say yes to hear the attachments, say help, or say wait, for more time. Should I list the attachments?";
				    }
		if(attachments.length==1){
			 speechOutput = "This message has one attachment.  It is "+attachments[0][0]+" named "+attachments[0][1]+".";
            		  speechOutput =speechOutput +"  You can say things like print attachment one, next message, or say help for more options. What would you like to do?";
			repromptOutput="You can say things like repeat that, help, or say wait, for more time. What woud you like to do?";
			}
		
		break;
	case 27: //user said yes to hear the attachment list
		    speechOutput="Here are the attachments.  To interrupt me, you can say Alexa, followed by a command.";
		    for (i=1;i<=session.attributes.attachments.length;++i){
            		speechOutput=speechOutput+"Attachment "+i+" is "+session.attributes.attachments[i-1][0]+" named "+session.attributes.attachments[i-1][1]+". ";
		    }
        	speechOutput=speechOutput+" You can say things like print attachment 1, next message, or say help for more options. What would you like to do?";
		    repromptOutput="You can say things like repeat that, help, or say wait, for more time. What would you like to do?";
		    break;
	case 28: //cancel handler
		    session.attributes.question=4;
		    if(session.attributes.messageList){session.attributes.helpContext=2;}
		    else {session.attributes.helpContext=1;}
		    speechOutput="Would you like to quit?";
		    repromptOutput="You can say yes to quit, say no to continue, say help, or say wait, for more time.  Would you like to quit?";
		    break;
	case 29: //repeatHandler    		
    		if(session.attributes.lastSpeech){speechOutput=session.attributes.lastSpeech;}
		    else {speechOutput="I'm sorry.  I don't have any speech available to repeat. You can say things like review my messages, help, or quit. What would you like to do?";}
		    repromptOutput="You can say help, say quit to exit, or say wait, for more time. What would you like to do?";
		    break;
	case 30: //delete confirm
		    speechOutput="Did you ask me to move this message to the trash folder?";
		    repromptOutput="You can say yes to erase this message, say no, or say help for more information.  Do you want to erase this message?";
            session.attributes.question=5;
        	break;
	case 31: //reserved;
		    break;
	case 32: //user said yes to "set a pin?"
		    speechOutput="To set an access pin, say set my pin, followed by a 4 digit number.  For example, you can say set my pin to 1 2 3 4.  What would you like to do?";
		    repromptOutput="If you don't want to decide on a PIN now, I will ask you again next time. You can say things like check my email, help, or say wait, for more time.  What would you like to do?";
		    break;
	case 33: //said no the question - list attachments?
	    session.attributes.helpContext=6;
		speechOutput="OK. You can say things like next message, print this, or say help for more options.  What would you like to do next?";
		repromptOutput="You can say things like next message, help or say wait, for more time.  What would you like to do?";
		break;
	case 34: //no question asked.
	    if(session.attributes.messageList){session.attributes.helpContext=6;}
		else {session.attributes.helpContext=4;}
		speechOutput = "Sorry, I don't think I asked a yes or no question. What would you like to do?";
		if(session.attributes.messageList){
			repromptOutput="You can say things like next message, read more, help or say quit if you're finished.  What would you like to do?";}
		else {repromptOutput="You can say things check my email, help or say quit if you're finished.  What would you like to do?";}
		break;
	case 35: //said no to prompted action (delete, reply, trash)
	    session.attributes.helpContext=6;
		speechOutput="OK. I canceled that.  You can say things like next message, print this, or say help for more options.  What would you like to do next?";
		repromptOutput="You can say things like next message, help or say wait, for more time.  What would you like to do?";
		break;
	case 36: //reserved
		break;
	case 37: //user said print/show me attachment on a message with no attachments.
	    speechOutput="This message has no attachments.  You can say things like next message, print this, or say help for more options.  What would you like to do?";
	    repromptOutput="You can say things like next message, help, or say wait, for more time.  What would you like to do?";
    	break;
	case 38: //User said show me but atatchments are not JPG or PNG images
	    if(session.attributes.attachments.length==1){
	        speechOutput="This message has one attachment, but it is not an image that I can send to the Alexa app. You can say things like print attachment 1, next message, or help. What would you like to do?";
	    } else {
		    speechOutput="This message has "+session.attributes.attachments.length+" attachments, but none of them are images that I can send to the Alexa app. You can say things like list the attachments, next message, or help. What would you like to do?";}
		repromptOutput="You can say things like next message, help, or say wait, for more time.  What would you like to do?";
		break;
	case 39: //user said show me an attachment that was not an image but some others are
	    speechOutput="This message has "+session.attributes.attachments.length+" attachments. ";
	    if(param1.length==1){speechOutput=speechOutput+" I can only show you Attachment "+param1[0];}
	    else {
	        speechOutput=speechOutput+" I can show you ";
	        for (i=0;i<param1.length-1;++i){
	            speechOutput=speechOutput+"attachment "+param1[i]+", ";
	        }
	        i=param1.length-1;
	        speechOutput=speechOutput+" or attachment "+param1[i];
	    }
	    speechOutput=speechOutput+". You can say things like show me attachment "+param1[0]+", print attachment one, next message, or help.  What would you like to do?";
	    repromptOutput="You can say things like show me attachment "+param1[0]+", print attachment one, next message, help, or say wait, for more time.  What would you like to do?";
	   break;
    case 40: //OK sent image to app
            speechOutput="OK.  I sent that to the Alexa app.  Very large files may not appear.  You can say things like next message or help.  What would you like to do next?";
            repromptOutput="You can say things like next message, help, or say wait, for more time.  What would you like to do?";
			 cardTitle="Image Attached to your message from "+session.attributes.currentMessage.from;
			 cardText="File name: "+session.attributes.attachments[param1][1];
			 imageurl=param2;
			 response.askWithImageCard (speechOutput, repromptOutput, cardTitle, cardText,imageurl);
		    break;
    case 41: //OK sent last speech to app
            speechOutput="OK.  I sent that to the Alexa app.  You can say things like next message or help.  What would you like to do next?";
            repromptOutput="You can say things like next message, help, or say wait, for more time.  What would you like to do?";
			cardTitle="Last Thing Said by the My Email Skill:";
			cardText="";
			tmpSpeech=session.attributes.lastSpeech;
			if(typeof tmpSpeech=='object'){
			    cardText=tmpSpeech.speech.replace(/<[^>]*>/g, "");
			} else {cardText=tmpSpeech;}
			response.askWithCard (speechOutput, repromptOutput, cardTitle, cardText);
			break;
	case 42: //user said "my PIN is..without a number or one not 4 digits
		speechOutput=speechText+"I think you were trying to speak an access PIN but I didn't understand the number.  Please say your four-digit number.  If you were not trying to say a PIN, try your request again.  What would you like to do?";
		repromptOutput="You can say your PIN, say help, say quit to exit, or say wait, for more time.  What is your four-digit PIN?";
		break;
	case 43: //user with a PIN set, opened skill without saying their PIN.
		speechOutput=speechText+"First, what's your four-digit access PIN?";
		repromptOutput="You can say your PIN, say help, say quit to exit, or say wait, for more time.  What is your four-digit PIN?";
		break;
	case 44: //user spoke incorrect PIN
		speechOutput = {speech:"<speak><p>"+speechText+"</p>Sorry. <say-as interpret-as=\"digits\">"+param1+"</say-as> is not the correct access PIN.  Please say your PIN again, or you can say help, or say quit to exit.  What would you like to do?</speak>",type: 'SSML'};
		repromptOutput="You can say your PIN, say help, say quit to exit, or say wait, for more time.  What is your four-digit PIN?";
		break;
	case 45: //user has no PIN, first use only prompts asking about setting one.
	    session.attributes.question=7;
		speechOutput=speechText+"If you would like to prevent others from reading your email using this Alexa device, you can set a 4 digit access pin.  You would need to remember this pin to access your email with Alexa.  Would you like to set a PIN now?";
		repromptOutput="If you say yes, I'll help you set a PIN.  If you say no, I won't ask again, but you can set a PIN any time by saying set my PIN.  Do you want to set a PIN now?";
		break;
	case 46: //user turned on advanced mode
		if(speechText){speechOutput=speechText;}
		else {speechOutput="Advanced mode is on.  If you change your mind, just say turn off advanced mode.  What's next?";}	
		repromptOutput="You can say things like review my messages, turn advanced mode off, help, or say wait, for more time.  What would you like to do?"; 
		break;
	case 47: //user turned off advanced mode
		if(speechText){speechOutput=speechText;}
		else {speechOutput="Advanced mode is off.  If you change your mind, just say turn on advanced mode.  What's next?";}	
		repromptOutput="You can say things like review my messages, turn advanced mode on, help, or say wait, for more time.  What would you like to do?"; 
		break;
	case 48: //user said a PIN when it was already accepted
		speechOutput="I think you were trying to speak your access PIN, but the PIN had already been accepted.  If you were trying to change your PIN, say set my PIN, followed by the new number.  Otherwise, please try your request again.  What would you like to do?";
		repromptOutput="You can say things like review my messages, help, or say wait, for more time.  What would you like to do?"; 
		break;
	case 50: //user tried to set PIN but slot was empty or not 4 digits
	    if(session.attributes.messageList){session.attributes.helpContext=6;}
	    else {session.attributes.helpContext=4;}
		speechOutput=speechText+"I think you were trying to reset your access PIN but I didn't understand the new number.  To reset your PIN, you can say set my pin to, followed by a 4-digit number, or say clear my PIN, to remove it.  If you were not trying to set your PIN, try your request again, or say help for more options.  What would you like to do?";
		repromptOutput="You can say things like review my messages,say help, for more options, or say wait, for more time.  What would you like to do?"; 
		break;
	case 51: //confirm successful PIN set
	    if(session.attributes.messageList){session.attributes.helpContext=6;}
	    else {session.attributes.helpContext=4;}
		speechText="<speak><p>OK.</p><p>I reset your access PIN to <say-as interpret-as=\"digits\">"+param1+"</say-as></p><p> You will need this new number to access this skill in the future.</p><p> You can say things like review my messages, or say help, for more options.</p> What would you like to do?</speak>";
		speechOutput={speech:speechText,type:'SSML'};
		repromptOutput="You can say things like review my messages, help, or say wait, for more time.  What would you like to do?"; 
		break;
	case 52: //OK PIN cleared.
	    if(session.attributes.messageList){session.attributes.helpContext=6;}
	    else {session.attributes.helpContext=4;}
	    speechOutput="OK. Anyone using this Alexa device can now access the email skill without a PIN. You can say things like review my messages, or help. What would you like to do?";
	    repromptOutput="You can say things like review my messages, help, or say wait, for more time.  What would you like to do?"; 
	    break;
	case 53: //wrong PIN lockout
	    speechText="<speak><p>I'm sorry. </p><p>This account has been temporarily locked after too many incorrect PIN attempts.</p>I sent PIN reset instructions to the Alexa app.</speak>";
	    speechOutput={speech:speechText,type:'SSML'};
	    cardTitle="My Email Skill is Locked";
	    cardText="To reset your PIN, use a browser to visit\r\n http://email-skill.blogspot.com/p/pin-reset.html";
	    response.tellWithCard (speechOutput, cardTitle, cardText);
	    break;
	case 54:
	    speechOutput="OK. I'll wait.";
        repromptOutput="You can say help, say quit to exit, or say wait again, for more time.  What would you like to do?";
    }
    }
    session.attributes.lastSpeech=speechOutput;
    response.ask(speechOutput,repromptOutput);
}

// Create the handler that responds to the Alexa Request.
exports.handler = function(event, context) {
    var myGmail = new MyGmail();
    myGmail.execute(event, context);
};
  