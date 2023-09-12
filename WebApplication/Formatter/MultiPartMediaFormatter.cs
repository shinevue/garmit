using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.IO;
using System.Threading.Tasks;
using garmit.Web.Binding;
using garmit.Core;

namespace garmit.Web.Formatter
{
    public class MultiPartMediaFormatter : BufferedMediaTypeFormatter
    {
        public MultiPartMediaFormatter()
        {
            base.SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/jpeg"));
            base.SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/png"));
            base.SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/bmp"));
            base.SupportedMediaTypes.Add(new MediaTypeHeaderValue("image/gif"));

            base.SupportedMediaTypes.Add(new MediaTypeHeaderValue("audio/mp3"));
            base.SupportedMediaTypes.Add(new MediaTypeHeaderValue("audio/wav"));
            base.SupportedMediaTypes.Add(new MediaTypeHeaderValue("audio/mpeg"));

            base.SupportedMediaTypes.Add(new MediaTypeHeaderValue("multipart/form-data"));
        }

        public override bool CanReadType(Type type)
        {
            return (type == typeof(Media));
        }

        public override bool CanWriteType(Type type)
        {
            return false;
        }

        public override object ReadFromStream(Type type, Stream readStream, HttpContent content, IFormatterLogger formatterLogger)
        {
            Media imageMedia = null;
            if (content.IsMimeMultipartContent() == false)
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }

            try
            {
                var task = Task.Run(async () => await content.ReadAsMultipartAsync());
                var provider = task.Result;

                var fileContent = provider.Contents.First(x => base.SupportedMediaTypes.Contains(x.Headers.ContentType));
                var buffer = fileContent.ReadAsByteArrayAsync().Result;
                var fileName = fileContent.Headers.ContentDisposition.FileName;
                var mediaType = fileContent.Headers.ContentType.MediaType;

                imageMedia = new Media(buffer, fileName, mediaType);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex);
            }

            return imageMedia;
        }
    }
}