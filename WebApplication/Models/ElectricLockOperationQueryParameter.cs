using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    public class ElectricLockOperationQueryParameter
    {
        public IEnumerable<int> LocationIds { get; set; }
        public bool Front { get; set; }
        public bool Rear { get; set; }
        public string Memo { get; set; }
        public string Purpose { get; set; }
        public IEnumerable<ExtendedPage> ExtendedPages { get; set; }
    }
}