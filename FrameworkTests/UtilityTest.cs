using System;
using System.IO;
using System.Linq;
using Utility;
using Xunit;

namespace UtilityTest
{
    public class UnixWrapperTest
    {
        private string cwd = Directory.GetCurrentDirectory();

        [Fact]
        public void UnzipTest()
        {
            UnixWrapper.UnzipZip(cwd, "min.zip", ".").Wait();
            var file = File.ReadAllText("min");
            File.Delete("min");
            Assert.True(file == "0123\n");
        }

        [Fact]
        public void SortFileTest()
        {
            UnixWrapper.SortFile(cwd, "unsorted", "sorted", true, true).Wait();
            var sorted = File.ReadAllLines("sorted");
            var expected = new[] { "3", "little", "piggies" };
            File.Delete("sorted");
            Assert.True(sorted.SequenceEqual(expected));
        }

        [Fact]
        public void UniqueTest()
        {
            UnixWrapper.Unique("unsorted", "unique", cwd).Wait();
            var uniqued = File.ReadAllLines("unique");
            var expected = new[] { "3", "piggies", "little", "3" };
            File.Delete("unique");
            Assert.True(uniqued.SequenceEqual(expected));
        }

        [Fact]
        public void RemoveNonAsciiFromFileTest()
        {
            UnixWrapper.RemoveNonAsciiFromFile(cwd, "min.zip", "ascii").Wait();
            var ascii = File.ReadAllLines("ascii");
            var expected = new[] { "PKNNmmin0123", "PKNNm minPK1&" };
            File.Delete("ascii");
            Assert.True(ascii.SequenceEqual(expected));
        }
    }
}