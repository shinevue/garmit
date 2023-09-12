using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    public class PatchCableQueryParameter
    {
        public int? PatchboardId { get; set; }
        public int PatchCableNo { get; set; }

        public IEnumerable<int?> PatchboardIds { get; set; }

        public IEnumerable<PatchCableSequence> AllowedUnfixedCables { get; set; }

    }
}