# Convert-out
A basic file convertor thatcan convert popular formats like mp4 and mp3, it's written with JS and it uses FFMPEG to convert files. 
# How it Works
Frontend: The HTML form allows users to select an MP3 file, which is then uploaded to the server via JavaScript.
Server: The Node.js server receives the MP3 file, uses FFmpeg to convert it to WMA, and then sends the WMA file back to the client as a download.

# Requirements
Node.js and FFmpeg installed on the server machine.
This solution is only for learning purposes and may need additional error handling and security checks for production use.
# How to Run
Just use node to run the server.js and open the index.html file, then u can convert to virtually any format!!! 
'node server.js' 
