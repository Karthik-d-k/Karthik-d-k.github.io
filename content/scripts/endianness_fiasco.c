#include <stdio.h>
// ------------------------------------------------------------------------------------------
// //
//                                        SNIPPET 1
// ------------------------------------------------------------------------------------------
// //

#include <endian.h>
#include <stdint.h>
#include <stdio.h>

int main1(void) {
  uint16_t data_u16 = 0x1122;
  uint16_t u16_be = htobe16(data_u16); // Store 16-bit data in big-endian format
  uint16_t u16_le =
      htole16(data_u16); // Store 16-bit data in little-endian format

  uint8_t *u8p_be = (uint8_t *)&u16_be; // Point to lowest address of `be` data
  uint8_t *u8p_le = (uint8_t *)&u16_le; // Point to lowest address of `le` data

  printf("data_u16  = %#x\n", data_u16);
  printf("u8p_be[0] = %#x\n", *u8p_be);
  printf("u8p_le[0] = %#x\n", *u8p_le);

  return 0;
}

// ------------------------------------------------------------------------------------------
// //
//                                        SNIPPET 2
// ------------------------------------------------------------------------------------------
// //

#include <stdint.h>
#include <stdio.h>

int main2(void) {
  uint16_t u16 = 0x1122;
  uint8_t *u8p = (uint8_t *)&u16;

  if ((*u8p) == 0x22) {
    printf("LITTLE ENDIAN\n");
  } else {
    printf("BIG ENDIAN\n");
  }

  return 0;
}

// ------------------------------------------------------------------------------------------
// //
//                                        SNIPPET 3
// ------------------------------------------------------------------------------------------
// //

#include <stdint.h>
#include <stdio.h>

int main3(void) {
  uint32_t u32_in = 0xDD223344;
  uint32_t u32_out = u32_in;
  uint32_t set_mask = 0x2000000;    // 25th bit is 1, everything else is 0
  uint32_t clear_mask = 0xFFFFFFBF; // 6th  bit is 0, everything else is 1

  u32_out |= set_mask;   // set   25th bit
  u32_out &= clear_mask; // clear 6th bit

  printf("u32_in : %#b\n", u32_in);
  printf("u32_out: %#b\n", u32_out);

  return 0;
}

// ------------------------------------------------------------------------------------------
// //
//                                        MAIN FUNC
// ------------------------------------------------------------------------------------------
// //
int main(void) {
  printf("Snippet 1:\n");
  main1();

  printf("\nSnippet 2:\n");
  main2();

  printf("\nSnippet 3:\n");
  main3();

  return 0;
}
