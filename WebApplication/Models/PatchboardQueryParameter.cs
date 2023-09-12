using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    public class PatchboardQueryParameter
    {
        public int PatchboardId { get; set; }

        public IEnumerable<int> PatchboardIds { get; set; }

        public int PathNo { get; set; }
    }
}