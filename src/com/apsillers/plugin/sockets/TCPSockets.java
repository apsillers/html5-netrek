package com.apsillers.plugin.sockets;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Arrays;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;

import android.annotation.TargetApi;
import android.util.Base64;
import android.util.Log;


public class TCPSockets extends CordovaPlugin {

	ArrayList<Socket> sockets = new ArrayList<Socket>();
	int sockNum = 0;
	
	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
		//Log.e("TCPSockets", "Plugin Called");
		if(action.equals("createSocket"))
			this.createSocket(args, callbackContext);
		else if(action.equals("send"))
			this.send(args, callbackContext);
		else if(action.equals("read"))
			this.read(args, callbackContext);
		else {
			callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.INVALID_ACTION));
			return false;
		}
		
		return true;
	}


	    public void createSocket(JSONArray args, CallbackContext callbackContext)
	    {
	        try {
	            String host = args.getString(0);
	            int port = args.getInt(1);
	            //Log.w("TCPSockets", "connecting to " + host + ":" + port);
	            try {           
	                Socket sock = new Socket(host, port);
	                //Log.d("TCPSockets", "Socket created");
	               
	                sockets.add(sock);
	                //Log.d("TCPSockets", "Socket stored as #" + this.sockNum);

	                int oldNum = this.sockNum;
	                this.sockNum += 1;
	               
	                callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, oldNum));
	            } catch (UnknownHostException e) {
	                Log.d("TCPSockets", "Unknown Host");
	                callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.IO_EXCEPTION));
	            } catch (IOException e) {
	                Log.d("TCPSockets", "IOException");
	                callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.IO_EXCEPTION, e.getMessage()));
	            }
	        } catch (JSONException e) {
	            Log.d("TCPSockets", "JSONException: " + e.getMessage());
	            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
	        }
	    }
	   
	  
		public void send(JSONArray args, CallbackContext callbackContext)
	    {
			//Log.w("TCPSockets", "sending");
	        try {
	            int socketId = args.getInt(0);
	            String message = args.getString(1);
	            byte[] bytes = Base64.decode(message, Base64.DEFAULT);
	            try {
	                Socket sock = sockets.get(socketId);
	                //Log.d("TCPSockets", "Socket selected");

	                OutputStream out = sock.getOutputStream();

	                //Log.d("TCPSockets", "Got out stream");

	                out.write(bytes);
	                out.flush();
	               
	                Log.d("TCPSockets", "Sent message");

	                //out.close();

	                callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, socketId));
	            } catch (UnknownHostException e) {
	                Log.d("TCPSockets", "Unknown Host");
	                callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.IO_EXCEPTION));
	            } catch (IOException e) {
	                Log.d("TCPSockets", "IOException");
	                callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.IO_EXCEPTION));
	            }

	        } catch (JSONException e) {
	            Log.d("TCPSockets", "JSONException: " + e.getMessage());
	            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
	        }
	    }



		public void read(final JSONArray args, final CallbackContext callbackContext)
	    {
			final PluginResult outerresult = new PluginResult(PluginResult.Status.NO_RESULT);
            outerresult.setKeepCallback(true);
			
			new Thread(new Runnable() {
				public void run() {
					try {
			            int socketId = args.getInt(0);
			            try {
			            	int BUFF_SIZE = 1024;
			            	
			                Socket sock = sockets.get(socketId);
			                //Log.d("TCPSockets", "Socket selected");
			               
			                boolean bufferEmpty = false;
			                
			                InputStream in = sock.getInputStream();
			                //Log.d("TCPSockets", "got in stream");
			                
			                while(true) {
				                byte[] buf = new byte[BUFF_SIZE];
				                int bytesRead = in.read(buf);
				                //Log.e("TCPSockets", "Read " + bytesRead + " bytes");
				                
				                if(bytesRead != BUFF_SIZE) {
				                	byte[] shortbuf = new byte[bytesRead];
				                	for(int i=0; i < bytesRead; ++i)
				                		shortbuf[i] = buf[i];
				                	buf = shortbuf;
				                    bufferEmpty = true;
				                }
				                if(bytesRead > 0) {
					                String reply = Base64.encodeToString(buf, Base64.NO_WRAP);
					                
					                //Log.e("TCPSockets", "returning" + reply);
					                PluginResult result = new PluginResult(PluginResult.Status.OK, reply); 
					                result.setKeepCallback(true);
					                callbackContext.sendPluginResult(result);
				                }
				                
				                if(bufferEmpty) {
				                	try {
										Thread.sleep(6);
									} catch (InterruptedException e) {
										e.printStackTrace();
									}
				                	bufferEmpty = false;
				                }
			                }
			                
			            } catch (IOException e) {
			                Log.d("TCPSockets", "IOException");
			                callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.IO_EXCEPTION));
			            }
			        } catch (JSONException e) {
			            Log.d("TCPSockets", "JSONException: " + e.getMessage());
			            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
			        }
				}
			}).start();
	    }
}
