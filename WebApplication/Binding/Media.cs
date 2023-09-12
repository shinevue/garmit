using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Binding
{
    public class Media
    {
        public byte[] Buffer { get; set; }
        public string FileName { get; set; }
        public string MediaType { get; set; }

        public Media(byte[] buffer, string fileName, string mediaType)
        {
            this.Buffer = buffer;
            this.FileName = fileName;
            this.MediaType = mediaType;
        }
    }
}